var companyId;
var data;
var candidateQuery;

module.exports = async function(choice,options) {
  if(choice == "register"){
    result = await require("./registerCompany")(options)
    if(result){
      successRegister(options)
    }
    else{
      alert("Registering company failed. Please try again later.")
    }
  }
  if(!companyId){
    alert("Please Login before continuing!")
    document.getElementById("loading").style.display = "none";
    return;
  }
  if(choice == 'queryAllCandidates'){
    ret = await require('./query')(choice,companyId);
    result = ret[0];
    if(result){
      data = ret[1].toString();
      success(false);
    }
    else{
      alert("Querying failed. Please try again later.")
      document.getElementById("loading").style.display = "none";
    }
  }
  else if(choice == 'queryCandidate'){
    ret = await require('./query')(choice,companyId,options);
    result = ret[0];
    if(result){
      candidateQuery = options;
      data = ret[1].toString();
      success(true);
    }
    else{
      alert("Querying failed. Please try again later.")
      document.getElementById("loading").style.display = "none";
    }
  }
  else if(choice == 'accept'){
    accept(options)
  }
  else if(choice == 'reject'){
    reject(options)
  }
};

function successRegister(options){
  alert("registered and logged in successfully!")
  $('#cid').replaceWith("<p class=\"nav-link\">Welcome "+ options + "!</p>");
  companyId = options;
  $('#myModal').modal('hide');
}

function success(single){
  var fs = require('fs');
  fs.writeFile('query.txt', data, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  let {PythonShell} = require('python-shell')
  let pyshell = new PythonShell('recreater.py');

  // sends a message to the Python script via stdin
  var candidateID = [];
  pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    candidateID.push(message);
  });

  // end the input stream and allow the process to exit
  pyshell.end(function (err,code,signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
    document.getElementById("loading").style.display = "none";
    if(single){
      candidateID.push(candidateQuery);
    }
    display(candidateID);
  });
}

function display(candidateID){
  if(candidateID.length==0){
    $('#noApps').css("display", "block");
  }
  else{
    $('#noApps').after("<div class=\"container-fluid\"> <p id=\"appendPoint\"></p>")
    for(i=0;i<candidateID.length;i++){
      iTag = "<div class=\"row\"><img src=\"r" + (i+1) + ".jpg\" width=\"500px\" style=\"margin-left: 400px; margin-bottom: 75px;\">"
      aTag = "<button class=\"btn vertical-center\" id=\"a"+candidateID[i]+"\"style=\"background-color: #a6a6a6;margin-left: 150px; height:50px; margin-top:300px;\" onclick=\"callAccept(\'"+candidateID[i]+"\')\">Accept "+candidateID[i]+"</button>"
      rTag = "<button class=\"btn vertical-center\" id=\"r"+candidateID[i]+"\"style=\"background-color: #a6a6a6;margin-left: 30px; height:50px; margin-top:300px;\" onclick=\"callReject(\'"+candidateID[i]+"\')\">Reject "+candidateID[i]+"</button></div>"
      $('#appendPoint').after(iTag+aTag+rTag)
    }
  }
  hideRelevant(candidateID);
}

function hideRelevant(candidateID){
  let {PythonShell} = require('python-shell')
  let pyshell = new PythonShell('status.py');

  // sends a message to the Python script via stdin
  var status = [];
  pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    status.push(message);
  });

  // end the input stream and allow the process to exit
  pyshell.end(function (err,code,signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
    for(i=0;i<status.length;i++){
      if(status[i]>0){
        console.log("a"+candidateID[i]);
        // document.getElementById("a"+candidateID[i]).style.display = "none";
        document.getElementById("r"+candidateID[i]).style.display = "none";
        if(status[i]==1){
          $('#a'+candidateID[i]).replaceWith("<p class=\"notification\">You have accepted "+ candidateID[i] + "!</p>");
        }
        else{
          $('#a'+candidateID[i]).replaceWith("<p class=\"notification\">You have rejected "+ candidateID[i] + "!</p>");
        }
      }
    }
  });
}

async function accept(candidateID){
  console.log(companyId);
  document.getElementById("loading").style.display = "flex";
  result = await require("./invoke")("acceptCandidate", companyId, candidateID)
  if(result){
    alert(candidateID+" Accepted successfully! Query again to see complete resume.")
  }
  else{
    alert("There was an error accepting " + candidateID +". Please try again later")
  }
  document.getElementById("loading").style.display = "none";
  location.reload();
}

async function reject(candidateID){
  document.getElementById("loading").style.display = "flex";
  result = await require("./invoke")("rejectCandidate", companyId, candidateID)
  if(result){
    alert(candidateID+" Rejected successfully!")
  }
  else{
    alert("There was an error rejecting " + candidateID +". Please try again later")
  }
  document.getElementById("loading").style.display = "none";
  location.reload();
}
