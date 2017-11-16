'use strict';

// First we get the dividend amount and date, (using source #1 and getJSON 
//(NEED TO ADD ERROR MSG, IF NO DIVIDEND)
function getLatestDividendData(stockSymbol) {
  let dividendJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/dividends/3m`;
  let stockQuoteJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
  $.getJSON(dividendJsonUrl, data1 => {
    let dividendAmount = data1[0].amount;  
    let dividendDate = data1[0].declaredDate; 
    $('.dividend-results-detail').html(`${stockSymbol.toUpperCase()}'s most recent quarterly dividend amount was:<br>$${dividendAmount}<br>
      <br>
      ${stockSymbol.toUpperCase()} declared that dividend on:<br>${dividendDate}<br>`);
    //Now we need another API call to get the stock quote on the dividend date (uses dividendDate, so has to be nested)
    $.getJSON(stockQuoteJsonUrl, data2 => {
      let quoteOnDividendDate = data2.find(item => item.date == dividendDate).close;
      let annualizedDividend = (4 * 100 * dividendAmount / quoteOnDividendDate).toFixed(2);
      $('.dividend-results-detail').append(`<br>${stockSymbol.toUpperCase()}'s stock quote on that date was $${quoteOnDividendDate}<br>`);
      $('.dividend-results-main').html(`<br>That represents an annualized return rate of:<br>${annualizedDividend}%<br>`);
      $('.top-bar-title').text(`${stockSymbol.toUpperCase()}'s annualized dividend rate: ${annualizedDividend}%:`);
      $('.top-stock-dividend').width(Math.min(annualizedDividend, 100) + '%')
                              .css("background-color", 'green')
                              .css("border", '1px solid black');
      $('.results-text').css("border", "1px solid black");
      $('.results-bar-chart').css("border", "1px solid black");
      getOneYearStockGains(stockSymbol);
      getOneYearSP500Gains(); //uses Vanguard's S&P500 fund - symbol: 'VOO'
    });
  }).error(function() { alert(`Error fetching data.\nMake sure the stock symbol is valid - check out the example buttons below.`) });  
}

function getOneYearStockGains(stockSymbol) {
  let stockQuoteJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
  $.getJSON(stockQuoteJsonUrl, data2 => {
    let latestStockQuote = data2[data2.length-1].close; //the last element in the 1y array of objects
    let stockQuoteOneYearBack = data2[0].close; //the first element in the 1y array of objects
    let annualGainNonDividend = ((100 * (latestStockQuote - stockQuoteOneYearBack) / stockQuoteOneYearBack)).toFixed(2);
    $('.non-dividend-results').html(`<br>Compare that to ${stockSymbol.toUpperCase()}'s non-dividend gains over 
      the past year (updated today):<br>${annualGainNonDividend}%`); 
    $('.middle-bar-title').text(`${stockSymbol.toUpperCase()}'s 1-year gain (non-dividend): ${annualGainNonDividend}%:`);
    $('.middle-stock-non-dividend').width(Math.min(annualGainNonDividend, 100) + '%')
                                  .css("background-color", 'darkorange')
                                  .css("border", '1px solid black');
  });
}

function getOneYearSP500Gains() {
  let sp500QuoteJsonUrl = `https://api.iextrading.com/1.0/stock/VOO/chart/1y`; 
  $.getJSON(sp500QuoteJsonUrl, data3 => {
    let latestSP500Quote = data3[data3.length-1].close; //the last element in the 1y array of objects
    let sp500QuoteOneYearBack = data3[0].close; //the first element in the 1y array of objects
    let sp500AnnualGain = ((100 * (latestSP500Quote - sp500QuoteOneYearBack) / sp500QuoteOneYearBack)).toFixed(2);
    $('.sp500-results').html(`<br>Also, compare that to the S&P-500 gains over 
      the past year (updated today):<br>${sp500AnnualGain}%`);  
    $('.bottom-bar-title').text(`S&P-500's 1-year gain: ${sp500AnnualGain}%:`);
    $('.bottom-sp500').width(Math.min(sp500AnnualGain, 100) + '%') 
                      .css("background-color", 'purple')
                      .css("border", '1px solid black');
  });
}

function clearAllResultsFields() {
  $('.top-bar-title').html(``);
  $('.middle-bar-title').html(``);
  $('.bottom-bar-title').text(``);

  $('.bar').css({"border":"0","background-color":"white"});
  
  $('.top-stock-dividend').html(``);
  $('.middle-stock-non-dividend').html(``);
  $('.bottom-sp500').html(``);

  $('.dividend-results-detail').html(``);
  $('.dividend-results-main').html(``);
  $('.non-dividend-results').html(``);
  $('.sp500-results').html(``);
  
  $('.results-text').css("border", "0");
}

function listenForFreeTextSubmission() {
  $('.input-form').submit(event => {
    event.preventDefault();
    clearAllResultsFields();
    const userInput = $(event.currentTarget).find('.stock-symbol-input');
    const userStockSymbol = userInput.val();
    getLatestDividendData(userStockSymbol);
  });
}

function listenForFixedButtonSubmission() {
  $('.fixed-button').click(event => {
    clearAllResultsFields();
    event.preventDefault();
    const userStockSymbol = $(event.currentTarget).text();
    getLatestDividendData(userStockSymbol);
  });
}

let errorFlag = 0;
$(listenForFreeTextSubmission);
$(listenForFixedButtonSubmission);


////////////////////////////////////////////////////////////
// OLD CODE, USING A DIFFERENT SOURCE (WAS TOO SLOW, SO SWITCHED TO IEXEXCHANGE.COM)

// const alphaVantageSearchUrl = 'https://www.alphavantage.co/query?';

// function getQuotesFromApi(stockSymbol, callback) {
//   const settings = {
//     url: alphaVantageSearchUrl,
//     data: {
//       function: 'TIME_SERIES_DAILY',
//       symbol: stockSymbol,
//       outputsize: 'full',
//       apikey: 'UXCF18J1Y037DMY6'
//     },
//     dataType: 'json',
//     type: 'GET',
//     success: callback
//   };
//   $.ajax(settings);
// }