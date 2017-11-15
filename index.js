'use strict';

//This app uses two sources: 
//(1) IEXtrading.com: uses https call ($.getJSON, no API key). Used for latest dividend amnt & date.
//(2) alphavantage.co: uses an ajax call ($.ajax). Used for stock quotes on different dates.

const alphaVantageSearchUrl = 'https://www.alphavantage.co/query?';
//Need date strings fot the JSON objects and for the API inputs
let d = new Date();
let yesterdaysDateString = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + (d.getDate()-1);
let oneYearBackString = (d.getFullYear()-1) + '-' + (d.getMonth()+1) + '-' + (d.getDate()-1);

function getQuotesFromApi(stockSymbol, callback) {
  const settings = {
    url: alphaVantageSearchUrl,
    data: {
      function: 'TIME_SERIES_DAILY',
      symbol: stockSymbol,
      outputsize: 'full',
      apikey: 'UXCF18J1Y037DMY6'
    },
    dataType: 'json',
    type: 'GET',
    success: callback
  };
  $.ajax(settings);
}

// First we get the dividend amount and date, (using source #1 and getJSON 
//(NEED TO ADD ERROR MSG, IF NO DIVIDEND)
function getLatestDividendData(stockSymbol) {
  let dividendJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/dividends/3m`;
  let stockQuoteJsonUrl = `https://api.iextrading.com/1.0/stock/${stockSymbol}/chart/3m`;
  $.getJSON(dividendJsonUrl, data1 => {
    let dividendAmount = data1[0].amount;  
    let dividendDate = data1[0].declaredDate; //global variable, b/c the nested getJSON uses this date
    console.log(dividendAmount);  //replace this with html overrides
    console.log(dividendDate);    //replace this with html overrides
    //Now we need another API call to get the stock quote on the dividend date
    $.getJSON(stockQuoteJsonUrl, data2 => {
      let quoteOnDividendDate = data2.find(item => item.date == dividendDate).close;
      console.log(quoteOnDividendDate);  //replace this with html overrides
    });
  });  
}

//Now we get the stock quotes from today vs 1 year ago (using source #2 and ajax)
function getQuotesOneYearApart(data) {
  //because not every day has trading, it's easier to convert the daily quotes into an array, so we 
  //can select them by index, rather than search for the closest day of trading
  let objectArray = [];
  for (let key in data['Time Series (Daily)']) {
    objectArray.push(data['Time Series (Daily)'][key]);
  }
  let mostRecentQuote = objectArray[0]['4. close'];
  let quoteFromOneYearAgo = objectArray[260]['4. close']; //261 trading days in a year
  console.log(mostRecentQuote);      //replace this with html overrides
  console.log(quoteFromOneYearAgo);  //replace this with html overrides
}

getLatestDividendData('AAPL');
getQuotesFromApi('AAPL', getQuotesOneYearApart);