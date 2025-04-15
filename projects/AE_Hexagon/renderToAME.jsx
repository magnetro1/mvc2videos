// deno-lint(no-var) :gun:

(function () {
  // Resolve file next to this script
  var scriptFile = File($.fileName);
  var scriptFolder = scriptFile.parent;
  var dataFilePath = scriptFolder.fsName + "/characterData.json";
  var dataFile = File(dataFilePath);

  $.writeln("🔍 Script running from: " + scriptFile.fsName);
  $.writeln("📂 Looking for JSON file at: " + dataFile.fsName);

  // Check if file exists
  if (!dataFile.exists) {
    $.writeln("❌ JSON file not found at: " + dataFile.fsName);
    alert("❌ Could not find characterData.json");
    throw new Error("Missing JSON data file");
  } else {
    $.writeln("✅ JSON file found.");
  }

  // Try opening
  if (!dataFile.open("r")) {
    $.writeln("❌ Failed to open JSON file.");
    alert("❌ Could not open JSON file");
    throw new Error("Failed to open characterData.json");
  }

  $.writeln("📖 Reading JSON file...");
  var jsonStr = dataFile.read();
  dataFile.close();

  // Optional: log raw string content
  // $.writeln("📄 JSON contents: \n" + jsonStr);

  // Parse using eval
  var characterData = eval(jsonStr);

  if (characterData && characterData.length > 1) {
    $.writeln("✅ Loaded " + (characterData.length - 1) + " characters from JSON.");
  } else {
    $.writeln("⚠️ JSON loaded but has no usable entries.");
  }


  // BEGIN
  // Assume `characterData` is already loaded

  var targetCompName = "{M}_Hexagon_V2";
  var controllerLayerName = "{M}_Hexagon_V2_CONTROLLER";
  var dropdownEffectName = "Character_Select";
  var dropdownPropName = "Menu";

  // Find the master comp
  var mainComp = null;
  for (var i = 1; i <= app.project.numItems; i++) {
    if (
      app.project.item(i) instanceof CompItem &&
      app.project.item(i).name === targetCompName
    ) {
      mainComp = app.project.item(i);
      break;
    }
  }

  if (!mainComp) {
    alert("❌ Could not find comp: " + targetCompName);
  } else {
    mainComp.openInViewer();

    // Set to render only 1 frame
    mainComp.workAreaStart = 0;
    mainComp.workAreaDuration = 1 / mainComp.frameRate;
    $.writeln("⏱️ Work area set to 1 frame");


    // Define and ensure output folder exists
    var outputFolder = new Folder("F:/AE_Renders");
    if (!outputFolder.exists) {
      var created = outputFolder.create();
      if (created) {
        $.writeln("📁 Created output folder: " + outputFolder.fsName);
      } else {
        alert("❌ Failed to create output folder: " + outputFolder.fsName);
        throw new Error("Cannot proceed without output folder.");
      }
    } else {
      $.writeln("📁 Output folder exists: " + outputFolder.fsName);
    }


    for (var c = 1; c <= 5; c++) {
      var charObject = characterData[c];

      $.writeln("🎮 Rendering " + charObject.name);

      // Set dropdown
      var dropdown = mainComp
        .layer(controllerLayerName)
        .property("Effects")
        .property(dropdownEffectName)
        .property(dropdownPropName);
      dropdown.setValue(c);

      // Add to render queue
      var rqItem = app.project.renderQueue.items.add(mainComp);
      rqItem.timeSpanStart = mainComp.workAreaStart;
      rqItem.timeSpanDuration = mainComp.workAreaDuration;

      var om = rqItem.outputModule(1);
      var fileName = outputFolder.fsName + "/" + charObject.name + ".png";

      om.file = new File(fileName);
      om.applyTemplate("PNG Sequence"); // This works in AE's render engine!

      $.writeln("📦 Rendering to: " + fileName);

      // Render this one item
      app.project.renderQueue.render();

      // Remove the render item from the queue to keep it clean
      rqItem.remove();
    }

    $.writeln("✅ Finished rendering all characters directly from AE.");
  }

})();
