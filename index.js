'use strict';

//This function generates and formats the summary bar charts and summary text:
//(1) Generates the url for the getJson
//(2) The JSON callback will extract all the dividend data (amount and date).
//(3) It will then run another getJson to get the stock quotes on the dividend date, today and 1 year back.
//(4) Then it will run another getJson to get the S&P500 quotes today and 1 yr back.
//(5) Then, it will render all the bar charts and textual summary for the dividend, the stock and the S&P-500.
//(6) Finally, it will alert the user if an invalid stock symbol was entered. 
function getDataRenderSummary(stockSymbol) {
  let dividendJsonUrl = makeDividendJsonUrl(stockSymbol);
  let stockQuoteJsonUrl = makeStockJsonUrl(stockSymbol);
  $.getJSON(dividendJsonUrl, data1 => {
    renderSummary(data1, stockSymbol, stockQuoteJsonUrl)
  }).error(e => { jsonErrorAlert(e) });  
}

function makeDividendJsonUrl(stockSymbol) {
  return `https://api.iextrading.com/1.0/stock/${stockSymbol}/dividends/3m`
}

function makeStockJsonUrl(stockSymbol) {
  return `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
}

//This function extracts the data and renders the summary text and bar charts
function renderSummary(data1, stockSymbol, stockQuoteJsonUrl) {
  //first we do error handling: if this stock symbol is valid, but does not bear dividends:
  if (data1[0] == undefined) { alert('This stock symbol is valid, but it does not bear dividends. Try another one!')}
  //otherwise, extract data and render results:
  else {
    let dividendAmount = data1[0].amount;  
    let dividendDate = data1[0].declaredDate; 
    renderText_DivAmtDate(stockSymbol, dividendAmount,dividendDate);
    //Now we need another API call to get the stock quote on the dividend date (uses dividendDate, so has to be nested)
    loadDivTextCharts(stockQuoteJsonUrl,stockSymbol, dividendDate, dividendAmount);  
    renderLogo(stockSymbol);
  }
}

//Get the dividend Json and render the summary text and bar charts for the dividend data
function loadDivTextCharts(stockQuoteJsonUrl,stockSymbol, dividendDate, dividendAmount) {
  $.getJSON(stockQuoteJsonUrl, data2 => { renderDivTextCharts(data2, stockSymbol, dividendDate, dividendAmount)});  
}

//Used by previous function - this part does the actual rendering of the dividend summary text and charts
function renderDivTextCharts(data2, stockSymbol, dividendDate, dividendAmount) {
  let quoteOnDivDate = getPriceOnDivDate(data2, dividendDate);
  let annualizedDiv = annualizeDividend(dividendAmount, quoteOnDivDate);
  renderDivRateText(stockSymbol, quoteOnDivDate, annualizedDiv)
  renderDivChart(stockSymbol, annualizedDiv);
  renderChartAreaBrdrs();
  //Now we get the non-dividend stock data, using another getJson
  getOneYearStockGains(stockSymbol);
  //And finally, we get the S&P500 baseline data, using another getJson
  getOneYearSP500Gains(); //uses Vanguard's S&P500 fund - symbol: 'VOO'
}

function getPriceOnDivDate(jsonData, dividendDate) {
  return jsonData.find(item => (item.date == dividendDate)).close;
}

function annualizeDividend(dividendAmount, quoteOnDivDate) {
  return (4 * 100 * dividendAmount / quoteOnDivDate).toFixed(2);
}

//Error handling - there are two primary errors:
//(1) User enters non-existing stock symbol - handled here.
//(2) User enters valid stock symbol, but it does not bear dividends - handled in makeDividendJsonUrl() above
function jsonErrorAlert(error) {
  alert(`This is not a valid stock symbol.\nTry a different one, or you can try the example buttons below.`) 
}

function renderChartAreaBrdrs() {
  $('.results-text').css("border", "1px solid black");
  $('.results-bar-chart').css("border", "1px solid black");
}

//Renders the dividend chart and chart title
function renderDivChart(stockSymbol, annualizedDiv) {
  $('.top-bar-title').text(`${stockSymbol.toUpperCase()}'s annualized dividend rate: ${annualizedDiv}%`);
  $('.top-stock-dividend').width(Math.min(annualizedDiv, 100) + '%')
                          .css("background-color", "mediumslateblue")
                          .css("border", "1px solid mediumslateblue");
}

function renderDivRateText(stockSymbol, quoteOnDivDate, annualizedDiv) {
  $('.dividend-results-detail').append(`-${stockSymbol.toUpperCase()}'s stock quote on that date was: $${quoteOnDivDate}<br>`);
  // $('.dividend-results-main').html(`<br>That represents an annualized return rate of: ${annualizedDiv}%<br>`);
}

//Render the summary text for the dividend amount and date
function renderText_DivAmtDate(stockSymbol, dividendAmount, dividendDate) {
  $('.results-text-title').html('More details:');
  $('.dividend-results-detail').html(`<br>-${stockSymbol.toUpperCase()}'s most recent quarterly dividend amount was: $${dividendAmount}<br>
    -${stockSymbol.toUpperCase()} declared that dividend on: ${dividendDate}<br>`);
}

//This function handles the gathering, extraction and rendering of the non-dividend stock data
function getOneYearStockGains(stockSymbol) {
  let stockQuoteJsonUrl = makeStockJsonUrl(stockSymbol);
  $.getJSON(stockQuoteJsonUrl, data2 => { renderNonDivResults(data2, stockSymbol) });
}

//This is the callback function for the getJson - it handles non-dividend data extraction and results rendering
function renderNonDivResults(data, stockSymbol) {
  let latestStockQuote = data[data.length-1].close; //the last element in the 1y array of objects
  let stockQuoteOneYearBack = data[0].close; //the first element in the 1y array of objects
  let annualGainNonDividend = oneYearGain(stockQuoteOneYearBack, latestStockQuote);
  renderNonDivHtml(stockSymbol, annualGainNonDividend);
}

//This function handles the rendering of the non-dividend stock data
function renderNonDivHtml(stockSymbol, annualGainNonDividend) {
  // $('.non-dividend-results').html(`<br>Compare that to ${stockSymbol.toUpperCase()}'s non-dividend gains over 
  //   the past year (updated today): ${annualGainNonDividend}%`); 
  $('.middle-bar-title').text(`${stockSymbol.toUpperCase()}'s 1-year gain (non-dividend): ${annualGainNonDividend}%`);
  $('.middle-stock-non-dividend').width(Math.min(annualGainNonDividend, 100) + '%')
                                .css("background-color", 'dodgerblue')
                                .css("border", '1px solid dodgerblue');  
}

//This function handles the gathering, extraction and rendering of the S&P-500 data
function getOneYearSP500Gains() {
  let sp500QuoteJsonUrl = makeStockJsonUrl('VOO');
  $.getJSON(sp500QuoteJsonUrl, data3 => { renderSP500results(data3) });
}

function renderSP500results(data) {
  let latestSP500Quote = data[data.length-1].close; //the last element in the 1y array of objects
  let sp500QuoteOneYearBack = data[0].close; //the first element in the 1y array of objects
  let sp500AnnualGain = oneYearGain(sp500QuoteOneYearBack, latestSP500Quote);
  renderSP500Html(sp500AnnualGain);
}

//This function handles the rendering of the S&P-500 data
function renderSP500Html(sp500AnnualGain) {
  // $('.sp500-results').html(`<br>Also, compare that to the S&P-500 gains over 
  //   the past year (updated today): ${sp500AnnualGain}%`);  
  $('.bottom-bar-title').text(`S&P-500's 1-year gain: ${sp500AnnualGain}%`);
  $('.bottom-sp500').width(Math.min(sp500AnnualGain, 100) + '%') 
                    .css("background-color", 'silver')
                    .css("border", '1px solid silver');
}

function oneYearGain(startQuote, endQuote) {
  return (100 * (endQuote - startQuote) / startQuote).toFixed(2);
}

//We use this function to clear the screen between runs
function clearAllResultFields() {
  $('.logo').html('');

  $('.top-bar-title').html('');
  $('.middle-bar-title').html('');
  $('.bottom-bar-title').text('');

  $('.bar').css({"border":"0","background-color":"white"});
  
  $('.top-stock-dividend').html('');
  $('.middle-stock-non-dividend').html('');
  $('.bottom-sp500').html('');

  $('.results-text-title').html('');
  $('.dividend-results-detail').html('');
  $('.dividend-results-main').html('');
  $('.non-dividend-results').html('');
  $('.sp500-results').html('');
  
  $('.results-text').css("border", "0");
}

function clearInputField() {
  $('.stock-symbol-input').val('');
}

//Finally, we need to setup two listeners:
function listenForFreeTextSubmit() {
  $('.input-form').submit(event => {
    event.preventDefault();
    clearAllResultFields();
    const userInput = $(event.currentTarget).find('.stock-symbol-input');
    const userStockSymbol = userInput.val();
    getDataRenderSummary(userStockSymbol);
  });
}

function listenForFixedButtonSubmit() {
  $('.fixed-button').click(event => {
    clearInputField(); //we need this 
    clearAllResultFields();
    event.preventDefault();
    const userStockSymbol = $(event.currentTarget).text();
    getDataRenderSummary(userStockSymbol);
  });
}

function renderLogo(stockSymbol) {
  let logoUrl = 'https://storage.googleapis.com/iex/api/logos/' + stockSymbol.toUpperCase() + '.png';
  $(".logo").html('<img src="' + logoUrl + '" alt="Selected company\'s URL" class="logo-img">');
}

$(listenForFreeTextSubmit);
$(listenForFixedButtonSubmit);
