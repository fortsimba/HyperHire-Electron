var candidateId;

module.exports = async function(choice,options) {
  if(choice == "register"){
    result = await require("./registerCandidate")(options)
    if(result){
      successRegister(options)
    }
    else{
      alert("Registering candidate failed. Please try again later.")
    }
  }
  if(!candidateId){
    alert("Please Login before continuing!")
    document.getElementById("loading").style.display = "none";
    return;
  }
  if(choice == "apply"){
    console.log(candidateId);
    result = await require("./invoke")("applyJob",options,candidateId);
    document.getElementById("loading").style.display = "none";
    if(result){
      success(options);
    }
    else{
      alert("Error submitting application!");
    }
  }
};

function success(options){
  alert("Succesfully applied to "+options+"!")
}

function successRegister(options){
  alert("registered and logged in successfully!")
  $('#cid').replaceWith("<p class=\"nav-link\">Welcome "+ options + "!</p>");
  candidateId = options;
  $('#myModal').modal('hide');
}


function printGlobal(){
  console.log(candidateId)
}


$(document).ready(function(){
    var pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';
    //
    // Asynchronous download PDF as an ArrayBuffer
    //
    var pdf = document.getElementById('myPdf');
    pdf.onchange = function(ev) {
      if (file = document.getElementById('myPdf').files[0]) {
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
          var loadingTask = pdfjsLib.getDocument(fileReader.result);
          loadingTask.promise.then(function(pdf) {
            console.log('PDF loaded');

            // Fetch the first page
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function(page) {
              console.log('Page loaded');

              var scale = 1;
              var viewport = page.getViewport({scale: scale});

              // Prepare canvas using PDF page dimensions
              var canvas = document.getElementById('pdfViewer1');
              var context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              // Render PDF page into canvas context
              var renderContext = {
                canvasContext: context,
                viewport: viewport
              };
              var renderTask = page.render(renderContext);
              renderTask.promise.then(function () {
                console.log('Page rendered');
              });
            });
          }, function (reason) {
            // PDF loading error
            console.error(reason);
          });
        };
        fileReader.readAsArrayBuffer(file);
      }
    }
});

function downloadImage(){
  return new Promise((resolve, reject) => {
    let result;
    const file = document.getElementById('myPdf').files[0];
    let {PythonShell} = require('python-shell')
    let pyshell = new PythonShell('imagify.py');
    pyshell.send(file.path);
    pyshell.end(function (err,code,signal) {
      if (err) throw err;
      console.log('The exit code was: ' + code);
      console.log('The exit signal was: ' + signal);
      console.log('Saved Image');
      result = true;
      resolve(result);
    });
  });
}

function parser(){
  return new Promise((resolve, reject) => {
    let result;
    let {PythonShell} = require('python-shell')
    let pyshell = new PythonShell('sectionizer.py');

    // sends a message to the Python script via stdin

    pyshell.on('message', function (message) {
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err,code,signal) {
      if (err) throw err;
      console.log('The exit code was: ' + code);
      console.log('The exit signal was: ' + signal);
      console.log('Saved parsed data');
      $('#companyId').css("display", "inline-block");
      $('#companyIdLabel').css("display", "inline-block");
      $('#submitImages').replaceWith("<button class=\"btn vertical-center\" style=\"margin:20px;background-color: #a6a6a6;\" onclick=\"applyJob()\" id=\"submitImages\">Submit Resume</button>");
      document.getElementById("loading").style.display = "none";
      result = true;
      resolve(result);
    });
  });
}
