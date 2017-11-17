'use strict';

//This function generates and formats the summary bar charts and summary text:
//(1) Generates the url for the getJson
//(2) The JSON callback will extract all the dividend data (amount and date).
//(3) It will then run another getJson to get the stock quotes on the dividend date, today and 1 year back.
//(4) Then it will run another getJson to get the S&P500 quotes today and 1 yr back.
//(5) Then, it will render all the bar charts and textual summary for the dividend, the stock and the S&P-500.
//(6) Finally, it will alert the user if an invalid stock symbol was entered. 
function getDataAndRenderSummary(stockSymbol) {
  let dividendJsonUrl = makeDividendJsonUrl(stockSymbol);
  let stockQuoteJsonUrl = makeStockJsonUrl(stockSymbol);
  $.getJSON(dividendJsonUrl, data1 => {
    extractDataAndRenderSummary(data1, stockSymbol, stockQuoteJsonUrl)
  }).error(e => { jsonErrorAlert(e) });  
}

function makeDividendJsonUrl(stockSymbol) {
  return `https://api.iextrading.com/1.0/stock/${stockSymbol}/dividends/3m`
}

function makeStockJsonUrl(stockSymbol) {
  return `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
}

function extractDataAndRenderSummary(data1, stockSymbol, stockQuoteJsonUrl) {
  //first we do error handling: if this stock symbol is valid, but does not bear dividends:
  if (data1[0] == undefined) { alert('This stock symbol is valid, but it does not bear dividends. Try another one!')}
  //otherwise, extract data and render results:
  else {
    let dividendAmount = data1[0].amount;  
    let dividendDate = data1[0].declaredDate; 
    renderSummaryText_DividendAmountAndDate(stockSymbol, dividendAmount,dividendDate);
    //Now we need another API call to get the stock quote on the dividend date (uses dividendDate, so has to be nested)
    getStockJsonAndRenderDividendSummaryAndCharts(stockQuoteJsonUrl,stockSymbol, dividendDate, dividendAmount);  
    renderLogo(stockSymbol);
  }
}

function getStockJsonAndRenderDividendSummaryAndCharts(stockQuoteJsonUrl,stockSymbol, dividendDate, dividendAmount) {
  $.getJSON(stockQuoteJsonUrl, data2 => renderDividendSummaryTextAndBarCharts(data2, stockSymbol, dividendDate, dividendAmount));  
}

function renderDividendSummaryTextAndBarCharts(data2, stockSymbol, dividendDate, dividendAmount) {
  let quoteOnDividendDate = extractStockQuoteOnDividendDate(data2, dividendDate);
  let annualizedDividend = annualizeDividend(dividendAmount, quoteOnDividendDate);
  renderSummaryText_DividendAnnualizedRate(stockSymbol, quoteOnDividendDate, annualizedDividend)
  renderDividendBarChartAndTitle(stockSymbol, annualizedDividend);
  renderBorders_resultsTextAndBarChartAreas();
  //Now we get the non-dividend stock data, using another getJson
  getOneYearStockGains(stockSymbol);
  //And finally, we get the S&P500 baseline data, using another getJson
  getOneYearSP500Gains(); //uses Vanguard's S&P500 fund - symbol: 'VOO'
}

function extractStockQuoteOnDividendDate(jsonData, dividendDate) {
  return jsonData.find(item => (item.date == dividendDate)).close;
}

function annualizeDividend(dividendAmount, quoteOnDividendDate) {
  return (4 * 100 * dividendAmount / quoteOnDividendDate).toFixed(2);
}

//Error handling - there are two primary errors:
//(1) User enters non-existing stock symbol - handled here.
//(2) User enters valid stock symbol, but it does not bear dividends - handled in makeDividendJsonUrl() above
function jsonErrorAlert(error) {
  alert(`This is not a valid stock symbol.\nTry a different one, or you can try the example buttons below.`) 
}

function renderBorders_resultsTextAndBarChartAreas() {
  $('.results-text').css("border", "1px solid black");
  $('.results-bar-chart').css("border", "1px solid black");
}

function renderDividendBarChartAndTitle(stockSymbol, annualizedDividend) {
  $('.top-bar-title').text(`${stockSymbol.toUpperCase()}'s annualized dividend rate: ${annualizedDividend}%`);
  $('.top-stock-dividend').width(Math.min(annualizedDividend, 100) + '%')
                          .css("background-color", 'green')
                          .css("border", '1px solid black');
}

function renderSummaryText_DividendAnnualizedRate(stockSymbol, quoteOnDividendDate, annualizedDividend) {
  $('.dividend-results-detail').append(`<br>${stockSymbol.toUpperCase()}'s stock quote on that date was: $${quoteOnDividendDate}<br>`);
  $('.dividend-results-main').html(`<br>That represents an annualized return rate of: ${annualizedDividend}%<br>`);
}

function renderSummaryText_DividendAmountAndDate(stockSymbol, dividendAmount, dividendDate) {
  $('.dividend-results-detail').html(`${stockSymbol.toUpperCase()}'s most recent quarterly dividend amount was: $${dividendAmount}<br>
    <br>${stockSymbol.toUpperCase()} declared that dividend on: ${dividendDate}<br>`);
}

//This function handles the gathering, extraction and rendering of the non-dividend stock data
function getOneYearStockGains(stockSymbol) {
  let stockQuoteJsonUrl = makeStockJsonUrl(stockSymbol);
  $.getJSON(stockQuoteJsonUrl, data2 => { extractAndRenderNonDividendResults(data2, stockSymbol) });
}

//This is the callback function for the getJson - it handles non-dividend data extraction and results rendering
function extractAndRenderNonDividendResults(data, stockSymbol) {
  let latestStockQuote = data[data.length-1].close; //the last element in the 1y array of objects
  let stockQuoteOneYearBack = data[0].close; //the first element in the 1y array of objects
  let annualGainNonDividend = oneYearGain(stockQuoteOneYearBack, latestStockQuote);
  renderNonDividendResults(stockSymbol, annualGainNonDividend);
}

//This function handles the rendering of the non-dividend stock data
function renderNonDividendResults(stockSymbol, annualGainNonDividend) {
  $('.non-dividend-results').html(`<br>Compare that to ${stockSymbol.toUpperCase()}'s non-dividend gains over 
    the past year (updated today): ${annualGainNonDividend}%`); 
  $('.middle-bar-title').text(`${stockSymbol.toUpperCase()}'s 1-year gain (non-dividend): ${annualGainNonDividend}%`);
  $('.middle-stock-non-dividend').width(Math.min(annualGainNonDividend, 100) + '%')
                                .css("background-color", 'darkorange')
                                .css("border", '1px solid black');  
}

//This function handles the gathering, extraction and rendering of the S&P-500 data
function getOneYearSP500Gains() {
  let sp500QuoteJsonUrl = makeStockJsonUrl('VOO');
  $.getJSON(sp500QuoteJsonUrl, data3 => { extractAndRenderSP500results(data3) });
}

function extractAndRenderSP500results(data) {
  let latestSP500Quote = data[data.length-1].close; //the last element in the 1y array of objects
  let sp500QuoteOneYearBack = data[0].close; //the first element in the 1y array of objects
  let sp500AnnualGain = oneYearGain(sp500QuoteOneYearBack, latestSP500Quote);
  renderSP500Results(sp500AnnualGain);
}

//This function handles the rendering of the S&P-500 data
function renderSP500Results(sp500AnnualGain) {
  $('.sp500-results').html(`<br>Also, compare that to the S&P-500 gains over 
    the past year (updated today): ${sp500AnnualGain}%`);  
  $('.bottom-bar-title').text(`S&P-500's 1-year gain: ${sp500AnnualGain}%`);
  $('.bottom-sp500').width(Math.min(sp500AnnualGain, 100) + '%') 
                    .css("background-color", 'purple')
                    .css("border", '1px solid black');
}

function oneYearGain(startQuote, endQuote) {
  return (100 * (endQuote - startQuote) / startQuote).toFixed(2);
}

//We use this function to clear the screen between runs
function clearAllResultsFields() {
  $('.logo').html('');

  $('.top-bar-title').html('');
  $('.middle-bar-title').html('');
  $('.bottom-bar-title').text('');

  $('.bar').css({"border":"0","background-color":"white"});
  
  $('.top-stock-dividend').html('');
  $('.middle-stock-non-dividend').html('');
  $('.bottom-sp500').html('');

  $('.dividend-results-detail').html('');
  $('.dividend-results-main').html('');
  $('.non-dividend-results').html('');
  $('.sp500-results').html('');
  
  $('.results-text').css("border", "0");
}

function clearManualInputField() {
  $('.stock-symbol-input').val('');
}

//Finally, we need to setup two listeners:
function listenForFreeTextSubmission() {
  $('.input-form').submit(event => {
    event.preventDefault();
    clearAllResultsFields();
    const userInput = $(event.currentTarget).find('.stock-symbol-input');
    const userStockSymbol = userInput.val();
    getDataAndRenderSummary(userStockSymbol);
  });
}

function listenForFixedButtonSubmission() {
  $('.fixed-button').click(event => {
    clearManualInputField(); //we need this 
    clearAllResultsFields();
    event.preventDefault();
    const userStockSymbol = $(event.currentTarget).text();
    getDataAndRenderSummary(userStockSymbol);
  });
}

function renderLogo(stockSymbol) {
  let logoUrl = 'https://storage.googleapis.com/iex/api/logos/' + stockSymbol.toUpperCase() + '.png';
  $(".logo").html('<img src="' + logoUrl + '" alt="Selected company\'s URL" class="logo-img">');
}

$(listenForFreeTextSubmission);
$(listenForFixedButtonSubmission);
