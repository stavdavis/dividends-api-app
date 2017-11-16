'use strict';

// First we get the dividend amount and date, (using source #1 and getJSON 
//(NEED TO ADD ERROR MSG, IF NO DIVIDEND)
function getLatestDividendData(stockSymbol) {
  let dividendJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/dividends/3m`;
  let stockQuoteJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
  $.getJSON(dividendJsonUrl, data1 => {
    let dividendAmount = data1[0].amount;  
    let dividendDate = data1[0].declaredDate; 
    $('.dividend-results').html(`${stockSymbol.toUpperCase()}'s most recent quarterly dividend amount was $${dividendAmount}<br>
      ${stockSymbol.toUpperCase()}'s most recent dividend declaration date was ${dividendDate}<br>`);
    //Now we need another API call to get the stock quote on the dividend date (uses dividendDate, so has to be nested)
    $.getJSON(stockQuoteJsonUrl, data2 => {
      let quoteOnDividendDate = data2.find(item => item.date == dividendDate).close;
      $('.dividend-results').append(`${stockSymbol.toUpperCase()}'s stock quote on that date was $${quoteOnDividendDate}<br>
        That represents an annualized return rate of ${(4 * 100 * dividendAmount / quoteOnDividendDate).toFixed(2)}%<br>`);
    });
  });  
}

function getOneYearStockGains(stockSymbol) {
  let stockQuoteJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/1y`;
  $.getJSON(stockQuoteJsonUrl, data2 => {
    let latestStockQuote = data2[data2.length-1].close; //the last element in the 1y array of objects
    let stockQuoteOneYearBack = data2[0].close; //the first element in the 1y array of objects
    let annualGainNonDividend = ((100 * (latestStockQuote - stockQuoteOneYearBack) / stockQuoteOneYearBack)).toFixed(2);
    $('.non-dividend-results').html(`<br>Compare that to ${stockSymbol.toUpperCase()}'s non-dividend gains over 
      the past year: ${annualGainNonDividend}% (updatad today)`); 
  });
}

function getOneYearSP500Gains() {
  //uses Vanguard's S&P500 fund - symbol: 'VOO'
  let sp500QuoteJsonUrl = `https://api.iextrading.com/1.0/stock/VOO/chart/1y`; 
  $.getJSON(sp500QuoteJsonUrl, data3 => {
    let latestSP500Quote = data3[data3.length-1].close; //the last element in the 1y array of objects
    let sp500QuoteOneYearBack = data3[0].close; //the first element in the 1y array of objects
    let sp500AnnualGain = ((100 * (latestSP500Quote - sp500QuoteOneYearBack) / sp500QuoteOneYearBack)).toFixed(2);
    $('.SP500-results').html(`<br>Also, compare that to the S&P-500 gains over 
      the past year: ${sp500AnnualGain}% (updatad today)`);  
  });
}

$('.input-form').submit(event => {
  event.preventDefault();
  const userInput = $(event.currentTarget).find('.stock-symbol-input');
  const userStockSymbol = userInput.val();
  // clear out the input
  getLatestDividendData(userStockSymbol);
  getOneYearStockGains(userStockSymbol);
  getOneYearSP500Gains(); //uses Vanguard's S&P500 fund - symbol: 'VOO'
});


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