//change stringify with a different method - something that will show my filters and which ones passed or failed
//change .html to . append/prepend
//function boolean will call by the function image representation

const foodAPI_key= '7c78de1ce63588186b9e3a918aaac764';
const foodAPI_id= '93f3f67f';

//UPC or Barcode Search 
function getDataFromApi(upcCode) {
  console.log("searching for "+upcCode);
  const URL=`https://api.edamam.com/api/food-database/parser?upc=${upcCode}&app_id=${foodAPI_id}&app_key=${foodAPI_key}`;
  $.getJSON(URL, upcCode, displaySearchData);
}

function displaySearchData(data) {
  console.log(data);
  let foodURI=data.hints[0].food.uri;
  let measureURI=data.hints[0].measures[0].uri;
  let namedItem=data.text;
 
  getNutritionData(foodURI,function (res){
    $('.js-search-results').html(
      displayTestResultsHTML (
        testResults(res)
      )
    );
  });  
}
// request to the ‘nutrients’ access point
function getNutritionData(foodURI,callback) {
  let foodObject= {"yield": 1,
	    "ingredients": [
		{
			"quantity": 1,
			"measureURI": "http://www.edamam.com/ontologies/edamam.owl#Measure_unit",
			"foodURI": foodURI,      
		}  
	]
}
 const settings = {
    url: `https://api.edamam.com/api/food-database/nutrients?app_id=`+ foodAPI_id +`&app_key=`+ foodAPI_key,
    ///change stringify with a different method
    data: JSON.stringify(foodObject),
    dataType: 'json',
    contentType: 'application/json',
    type: 'POST',
    success: callback
  };

  $.ajax(settings);
}

function statusError (){
  let retries = 3;
  if (retries > 0) {
		console.log('trying to load #', retries);
		retries--;
		setTimeout(statusError, 2000);
  } 
  if (status == 'timeout') {
		$(".event-list").html('<div class="js-search-results"><p>It\'s not you, it\'s us. Please try again.</p></div>');
  }
}

//Search by name and get upcCode
function getUPCFromAPI (name){
  const upcUrl=`https://api.upcitemdb.com/prod/trial/search?s=${name}&match_mode=0&type=product`

   $.getJSON(upcUrl, name, SearchUPC);
}

function SearchUPC(data) {
  let itemUPC=data.items[0].upc;
  console.log(data.items[0].upc);
  getDataFromApi(itemUPC)
}

function testFoodFilter(foodObject, filter){
  return Boolean (foodObject.healthLabels.find(label=>{
   const healthText= label.toUpperCase()
   const filterText= filter.toUpperCase().replace(/-/g,"_") 
   console.log(`testing if ${healthText}==${filterText}`)
   return healthText === filterText;
  }));
}

function getSelectedFilters() {
  // array that will store the value of selected checkboxes 
  var selectedFilters = []; 
  let inputFields = $('input[type="checkbox"]:checked');
  inputFields.each(function(){
    selectedFilters.push($(this).closest("label").find("span").text());
  })
  console.log(selectedFilters);
  return selectedFilters;
}

function passingResults(filters){
   return Base.containers.find(function(i){
      return i.get('entityid')===id;
   });
}
//get test results
function testResults(foodObject){
  const results= {

    pass: [],
    fail: []
  }
   getSelectedFilters().forEach(filter=>
   {
    const didPass = testFoodFilter(foodObject, filter);
    if (didPass){
      results.pass.push(filter)
    }
    else {
      results.fail.push(filter)
    }
   });
   return results;
}

//display html results
function displayTestResultsHTML (results){
  let htmlRes="<div>";
    
    if (results.fail.length === 0){
      htmlRes+="<span class='fa fa-check success' aria-hidden='true'></span><span class='success'>It looks good!</span>"
    }

    else{ 
      htmlRes+=`<span class='fa fa-exclamation-circle error' aria-hidden='true'></span><span class='error'>This is not for you! it did not pass your filters:<br> ${results.fail.join(", ")}<br></span>`
    }

htmlRes+="</div>"

return htmlRes;
}

function stringIsUpc(input){
const pattern=  /^[0-9 ]+$/ //regular expression
return pattern.test(input.trim());
}

function watchSubmit() {
  $('.js-search-form').submit(event => {
    event.preventDefault();
    let queryTarget = $(event.currentTarget).find('.js-query');
    let query = queryTarget.val();
    // clear out the input
    queryTarget.val("");
    if (stringIsUpc(query)){
      getDataFromApi(query);
    } else if (getUPCFromAPI(query)){
      getDataFromApi(query)
      console.log("not a UPC Code")
    }
  });
}

$(watchSubmit);