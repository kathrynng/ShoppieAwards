//Global Vars
var userNomi = []
var tempResults = []

var searchBoxValidation = $('.input-validation')

var searchResultsArea = $('#search-result-area')
var nomiArea = $('#nomi-area')

var resultsList = $('#results-list')
var ownList = $('#nomi-list')

$(document).ready(function() {
  searchResultsArea.css("visibility","hidden")
  nomiArea.css("visibility","hidden")
  
  $('#movieName').on("input", function(){
    $('#movieName').css("border-color","#ced4da")
    $('#clear').css("border-color","#ced4da")
    searchBoxValidation.css("display","none")
  })

  $('form').submit(function() {
    searchBoxValidation.css("display","none")
    const movieName = $('#movieName').val()
    const regex = /^[0-9a-zA-Z]+$/;  
    
    // Validation (Regex) + Conversion 
    if(!movieName || !movieName.match(regex)){
      $('#movieName').css("border-color", "red")
      $('#clear').css("border-color","red")
      searchBoxValidation.css("display","inline")
      return false
    }

    const newMovieName = movieName.trim() 
    const urlMovieName = encodeURIComponent(newMovieName)
    // Request + Refresh List if movies exist
    getResult(urlMovieName).then((result) => {
      tempResults = result
      buildList(tempResults, newMovieName)
    })
    .catch(function() {
      $('#movieName').css("border-color", "red")
      $('#clear').css("border-color","red")
      searchBoxValidation.css("display","inline")
    })

    return false
  })

  // Clear Search Bar
  $('#clear').click(function() {
    $('#movieName').val('')
  })

})

function buildList(moviesArr, newMovieName){
  $('#errorMsgs').html("")
  resultsList.empty()
  if(moviesArr.length > 0){
    searchResultsArea.css("visibility","visible")
    $('#search-result-header').html("Results for '"+ newMovieName + "'")
    $.each(moviesArr, function (index, value){
      var movieItem = value.Title + " (" + value.Year +")"
      var nomiBtn = '<button onclick="addToNomiList(\'' + value.Id +'\')" class="nomiBtn btn btn-success" id="nomiID-' + value.Id + '">Nominate</button>'
      resultsList.append('<li>' + movieItem + nomiBtn +'</li>')

      //check if existing movies are added
      var existingMovie = userNomi.find(movie => movie.Id === value.Id)
      if(existingMovie){
        var selectId = '#nomiID-' + value.Id
        $(selectId).prop('disabled', true)
      }
    })
  } else {
    $('#errorMsgs').html("No results for '"+ newMovieName + "'")
    searchResultsArea.css("visibility","hidden")
  }
}

function getResult(movieName){
  return new Promise(function(resolve){
    var request = new XMLHttpRequest()
    var arr = []
    
    var searchReq = 'http://www.omdbapi.com/?apikey=56f45916&s=' + movieName
    request.onload = function () {
      var results = JSON.parse(this.response)
      if (request.status >= 200 && request.status < 400 && results.Response) {
        if(results.Response === "True"){
          results.Search.forEach(movie => {
            if(movie.Type === "movie")
              arr.push({Title: movie.Title, Year: movie.Year, Id: movie.imdbID})
          });
          resolve(arr)
        } else {
          resolve(arr)
        }
      }
    }
    request.open('GET', searchReq, true)
    request.send()
    })
}

//add to list and update list if any
function addToNomiList(movieId){
  // check if top 5 already picked
  if(userNomi.length < 5){
    //save to array
    var movieInfo = tempResults.find(movie => movie.Id === movieId)
    userNomi.push(movieInfo)

    //disable add button
    var selectId = '#nomiID-' + movieId
    $(selectId).prop('disabled', true)

  } else {
    var alert = $("#fullAlert")
    alert.removeClass("hide")
    alert.addClass("show")
    setTimeout(function(){
      alert.removeClass("show")
      alert.addClass("hide")
    }, 5000)
  }
  //refresh + update list
  showUserList()
}

function removeFromNomiList(movieId){
  //delete from array
  var movieIndex = userNomi.findIndex(movie => movie.Id === movieId)
  userNomi.splice(movieIndex, 1)
  
  //enable add button
  var selectId = '#nomiID-' + movieId
  $(selectId).prop('disabled', false)
  
  //refresh + update list
  showUserList()

}

function showUserList(){
  ownList.empty()
  if(userNomi.length > 0){
    nomiArea.css("visibility","visible")
    $('#user-nomi-header').html("Nominations")
    $.each(userNomi, function(index, value){
      var nomiItem = value.Title + " (" + value.Year +")"
      var removeBtn = '<button onclick="removeFromNomiList(\'' + value.Id +'\')" class="removeBtn btn btn-danger" id="removeID-' + value.Id + '">Remove</button>'
      ownList.append('<li>' + nomiItem + removeBtn + '</li>')
    })
  }else{
    nomiArea.css("visibility","hidden")
    $('#user-nomi-header').html("")
  }
}
