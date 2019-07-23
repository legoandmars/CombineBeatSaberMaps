var fs = require("fs");
var path = require('path');

var difficultyCounter = 0;
var songepath = "./Beatmaps/";
var allNotes = [];
var allEvents = [];
var allObstacles = [];
fs.readdir(songepath, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }
  files.forEach(function (file, fileIndex) {
    fs.stat(songepath, function (error, stat) {
      if (error) {
        console.error("Error stating file.", error);
        return;
      }

      if (stat.isDirectory()){
      	var joinedPath = path.join(songepath,file);

      	var rawdata = fs.readFileSync(joinedPath+"/info.dat");
      	var index = JSON.parse(rawdata);
      	var mapBpm = index["_beatsPerMinute"];
      	var songOffset = index["_songTimeOffset"];
		var difficultyValues = Object.values(index["_difficultyBeatmapSets"])[0];
		var diffValues2 = Object.values(difficultyValues)[1];
		for(var key in diffValues2){
			difficultyCounter++;
			var currentJson = diffValues2[key];
			var beatmapData = fs.readFileSync(joinedPath+"/"+currentJson["_beatmapFilename"]);
			console.log("Merging "+currentJson["_beatmapFilename"]+" of "+file);
			var parsedBeatMap = JSON.parse(beatmapData);
			var getNotes = JSON.parse(JSON.stringify(parsedBeatMap["_notes"]));
			var getEvents = JSON.parse(JSON.stringify(parsedBeatMap["_events"]));
			var getObstacles = JSON.parse(JSON.stringify(parsedBeatMap["_obstacles"]));
			for(var itemkey in getNotes){
				if (Object.keys(getNotes[itemkey])[0] == "_time"){
					var bpmMult = mapBpm/100;
					var newTime = (Object.values(getNotes[itemkey])[0]+songOffset)*bpmMult;
					var newNotes = {'_time':newTime,'_lineIndex':Object.values(getNotes[itemkey])[1],'_lineLayer':Object.values(getNotes[itemkey])[2],'_type':Object.values(getNotes[itemkey])[3],'_cutDirection':Object.values(getNotes[itemkey])[4]}
					allNotes.push(newNotes);
				}
			}
			for(var itemkey in getEvents){
				if (Object.keys(getEvents[itemkey])[0] == "_time"){
					var bpmMult = mapBpm/100;
					var newTime = (Object.values(getEvents[itemkey])[0]+songOffset)*bpmMult;
					var newNotes = {'_time':newTime,'_type':Object.values(getEvents[itemkey])[1],'_value':Object.values(getEvents[itemkey])[2]}
					allEvents.push(newNotes);
				}
			}
			for(var itemkey in getObstacles){
				if (Object.keys(getObstacles[itemkey])[0] == "_time"){
					var bpmMult = mapBpm/100;
					var newTime = (Object.values(getObstacles[itemkey])[0]+songOffset)*bpmMult;
					var newNotes = {'_time':newTime,'_lineIndex':Object.values(getObstacles[itemkey])[1],'_type':Object.values(getObstacles[itemkey])[2],'_duration':Object.values(getObstacles[itemkey])[3],'_width':Object.values(getObstacles[itemkey])[4]}
					allObstacles.push(newNotes);
				}
			}
		}
		if(fileIndex >= files.length - 1){
			console.log("DONE!");
			var mainBeatMapData = fs.readFileSync("./CombinedMap/ExpertPlus.dat");
			var parsedMBMD = JSON.parse(mainBeatMapData);
			parsedMBMD["_notes"] = allNotes;
			parsedMBMD["_events"] = allEvents;
			parsedMBMD["_obstacles"] = allObstacles;
			fs.writeFile("./CombinedMap/ExpertPlus.dat", JSON.stringify(parsedMBMD), function (err) {
			  if (err) return console.log(err);
			  console.log('exported');
			});

		}
      }
    });
  });
});
