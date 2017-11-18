# The Simple Dividend Analyzer

#### Background
Even experienced investors can have a bias toward the appeal of dividend bearing stocks. They "promise a fixed return", after all.
Or do they? 
The Simple Dividend Analyzer is an easy way to avoid over-estimating the attractivenes of dividends: it provides a quick snapshot of the full(er) picture, including the non-dividend gains of the stock and the market returns as a whole. That should balance the perception of the dividend's "promise". In many cases, it will be shaddowed by the overall losses of the stock; in other cases it will be shaddowed by the overall returns of the market as a whole. And even when the stock has great overall gains (such as Apple's 50%+ gains in 2017). In fact, when a company announces a dividend, it's essentially saying "we couldn't figure out a better way to spend this money on more growth, so we'll just give it to you", which should be factored into the analysis. 
#### Summary of Functionality
The app allows the user to input any stock symbol. If that stock is dividend bearing, the app will compute its annualized dividend rate and compare it to the non-dividend performance of that stock over the past year, as well as the market baseline performance over the past year (S&P 500).

#### UI and Screenshots
This is the entry screen - it asks the user to enter a stock symbol manually, or choose from five pre-made examples.
![Entry Screen](/screenshots/entry-screen.png =50x)
<img src="/screenshots/entry-screen.png" alt="Entry screen" style="width: 50px;"/>
The app then uses three getJson calls to obtain the following data:
* JSON #1 gets the dividend data: 
	* Dividend amount
	* Dividend declaration date
* JSON #2 gets the stock data:
	* Stock quote on date of dividend declaration (for dividend rate calculation)
	* Stock quote today
	* Stock quote one year ago (for annual return calculation)
* JSON #3 gets the market baseline:
	* Vanguard's S&P-500 fund value today
	* Vanguard's S&P-500 fund value one year ago (for annual return calculation)
The app then generates a clean bar chart represntation of that comparative data:
* Annualized dividend amount 
* Annual non-dividend return of the stock ("what else did this stock do")
* Annual return of the market baseline
The bar charts are generated with div elements, with widths that are dynamically controlled by JS (the only formatting not fully controlled by css).
Below is an example screenshot, using the APPL (Apple, Inc.) case study:
![Apple results screen](/screenshots/appl-results.png)
The point of this and other examples is that the dividend is relatively small and proves to be a fairly bad driver for a decision to buy a stock. It might distract from its overall performance. In some cases (such as Apple's), it does align with overall success, but the correlation is far from perfect.

#### Error Handling
There are two possible errors (other than loss of internet connection):
* User inputs an invalid stock symbol (example: 'ASDDEASAD')
* User inputs a valid symbol, but that stock does not bear a dividend (example: 'GOOG' for Google)
Both errors are caught and handled with an alert that doesn not crash the app. Below are two screenshots:
![Invalid symbol error](/screenshots/invalid-error.png)
![Valid but no dividend error](/screenshots/no-dividend-error.png)

Formatting
The design was deliberately kept minimalist, as this is an analysis tool rather than a consumer facing app. 
Dynamic layout has been implemented to adjust the appearance to different screen sizes (most elements grow proportionately up to a screen width of 550px, at which point all dimensions freeze and align to the center of the page).

#### Technology used
This simple app uses HTML, CSS, JavaScript and jQuery.

#### Browser compatibility
This app has been tested and works on all major browsers (Chrome, Firefox, Edge, Safari) except IE11 (due to handling of template literals and backticks specifically). Babel will be used in future iterations to handle that issue.

