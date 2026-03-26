

const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";



async function getCoins(){
    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data)
        data.forEach(coin => {
    console.log("market_cap_rank: ",coin.market_cap_rank,"coin_name: ",coin.name,coin.current_price,"24h_high: ",coin.high_24h,"24h_low: ",coin.low_24h,"price_timeStamp: ",coin.last_updated);
});
        
    } catch (error) {
        console.error("error fetching data: ",error);
    }
}


let appReady = false
// getCoins();


function getCapital() {
  const value = localStorage.getItem("capital");
  return value ? Number(value) : 0;
}

let initialBalance = getCapital();

const state = {
    balance: initialBalance,
    portfolio: {},
    market: {},
    trades: [],
    lastMarketUpdate: 0
};
if (state.balance === 0) {
  showAlert("Set your capital to start trading", "error");
}

window.saveCapital = function () {
  const input = document.getElementById("capital");
  const value = Number(input.value);

  if (!value || value <= 0) {
    showAlert("Enter valid capital", "error");
    return;
  }

  if (value > 1000000) {
    showAlert("Capital too large", "error");
    return;
  }

  localStorage.setItem("capital", value);
  state.balance = value;
  initialBalance = value;

  document.getElementById("capitalInputBox").style.display = "none";
};
// function cleanNumber(num, decimals = 8){
//     if(Math.abs(num) < 1e-8) return 0
//     return Number(num.toFixed(decimals))
// }



// async function loadPortfolio() {
//     try {
//         const file = await fs.readFile("./portfolio.json","utf-8")
//         const data = await JSON.parse(file)

//         state.balance = data.balance
//         state.portfolio = data.portfolio

//     } catch (error) {
//         console.log("no saved portfolio found, starting fresh");
        
//     }
// } //  this func only works in nodejs , browser cannot read local files directly , we have to use localStorage

function loadPortfolio() {
    const saved = localStorage.getItem("portfolio")
    if(saved){
        const data = JSON.parse(saved)

        state.balance = data.balance
        state.portfolio = data.portfolio
        state.trades = data.trades || [];
        console.log("portfolio loaded from localStorage")
        
    }else{
        console.log("no saved portfolio found")
        
    }
}

function savePortfolio(params) {
    const data ={
        balance:state.balance,
        portfolio:state.portfolio,
        trades: state.trades,
        capital: initialBalance 
    }

    // await fs.writeFile("./portfolio.json",JSON.stringify(data,null,2))  
    //cannot use fs module outside nodejs env , browser cannot write files loacally it can only write localstorage
    localStorage.setItem("portfolio",JSON.stringify(data,null,2))
}


async function fetchMarket(){

    const response = await fetch(url)
    const data = await response.json()
    state.market = {}
    data.forEach(coin => {

        state.market[coin.id] = {
            name: coin.name,
            symbol: coin.symbol,
            price: coin.current_price,
            high24h: coin.high_24h,
            low24h: coin.low_24h,
            volume: coin.total_volume,
            marketCap: coin.market_cap,
            rank: coin.market_cap_rank, 
            image: coin.image,  
            lastUpdated: coin.last_updated
        }

    })

    return state.market

}

// const coinId = document.getElementById("coinInput").value.toLowerCase();
// async function fetchCoinIfNotExists(coinId) {
//   if (coinCache[coinId]) return coinCache[coinId];

//   try {
//     const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
//     if (!res.ok) throw new Error("Not found");

//     const data = await res.json();

//     const coin = {
//       id: data.id,
//       name: data.name,
//       price: data.market_data.current_price.usd
//     };

//     coinCache[coinId] = coin;
//     return coin;

//   } catch (err) {
//     showAlert("Coin not found ❌", "error");
//     return null;
//   }
// }


// async function fetchNews() {
//     try {
//         const res = await fetch("https://cryptopanic.com/api/v1/posts/?auth_token=490b9c13b4237aa8d916959b2b8fc31fddc619d8&public=true")
//         const data = await res.json()

//         return data.results

//     } catch (error) {
//         console.log("Error fetching news:", error)
//         return []
//     } // cors error proxy needed search it up once
// }
// async function fetchNews() {
//     try {
//         const res = await fetch(
//             "https://newsapi.org/v2/everything?q=crypto&sortBy=publishedAt&apiKey=edea3752487d472ab4c54c0e7c9c2905"
//         )

//         const data = await res.json()

//         return data.articles

//     } catch (error) {
//         console.log("Error fetching news:", error)
//         return []
//     }
// }



// searchInput.addEventListener("keydown", async (e) => {
//   if (e.key === "Enter") {
//     e.preventDefault();   // 🔥 must

//     const coinId = searchInput.value.trim().toLowerCase();
//     if (!coinId) return;

//     await handleCoinSearch(coinId);

//     searchInput.blur(); // hide keyboard
//   }
// });
async function searchCoin() {
  const coinId = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!coinId) return;

  await handleCoinSearch(coinId);

  document.getElementById("searchInput").blur();
}

async function handleSearchClick() {
  // Get value from whichever input is available
  const navInput = document.getElementById("searchInputNav");
  const bodyInput = document.getElementById("searchInputBody");
  
  const coinId = (navInput?.value || bodyInput?.value || "").trim().toLowerCase();
  if (!coinId) return;

  await handleCoinSearch(coinId);

  // Blur whichever input has focus
  if (navInput?.value) {
    navInput.blur();
    navInput.value = "";
  }
  if (bodyInput?.value) {
    bodyInput.blur();
    bodyInput.value = "";
  }
}
async function handleCoinSearch(coinId) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    if (!res.ok) throw new Error("Coin not found");

    const data = await res.json();

    state.market[coinId] = {
      name: data.name,
      symbol: data.symbol,
      price: data.market_data.current_price.usd,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      volume: data.market_data.total_volume.usd,
      marketCap: data.market_data.market_cap.usd,
      rank: data.market_cap_rank,
      image: data.image.small,
      lastUpdated: data.market_data.last_updated
    };

    document.getElementById("coinInput").value = coinId;

    renderCoinInfo(coinId);
    loadChart(data.symbol.toUpperCase());

    showAlert(`Loaded ${data.name} ✅`, "success");

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    showAlert("Coin not found ❌", "error");
  }
  
}

 function  readCache() {
   const cache = localStorage.getItem("marketCache")

   if(!cache) return null

   return JSON.parse(cache)
} 
 function writeCache(data) {
    const cache= {
        lastMarketUpdate:Date.now(),
        data:data
    }
    localStorage.setItem("marketCache",JSON.stringify(cache))
 }
 
 const cacheTime = 60*5*1000;

 
 async function updateMarket() {
    const cache= readCache();
    
    if(cache && (Date.now() - cache.lastMarketUpdate < cacheTime)){
        console.log("using cached data");
        state.market = cache.data 
        return cache.data
    }
    console.log("fetching new market data...");

      try {
        const data = await fetchMarket();

        if (Object.keys(data).length > 0) {
            writeCache(data);
            return data;
        }

        throw new Error("Empty API data");

    } catch (err) {
        console.log("API + cache failed");

        if (cache) {
            state.market = cache.data;
            return cache.data;
        }

        // ❗ FINAL FAIL CASE
        showMarketError();   // 👈 add this
        return {};
    }
}



async function buy(coin, amount){
    if(amount<=0 || !Number.isFinite(amount)){
        showAlert("enter a valid amount","error");
        return
        
    }
    if(Object.keys(state.market).length === 0){
        showAlert("Market data not loaded yet","error")
        return
    }

    coin = coin.toLowerCase()

    if(!state.market[coin]){
        console.log("----------------------------------------------------")
        showAlert("Coin not found in market","error")
        return
    }

    const price = state.market[coin].price
    const cost = price * amount

    if(cost > state.balance){
        console.log("----------------------------------------------------")
        showAlert("Not enough balance","error")
        return
    }

    if(!state.portfolio[coin]){
        state.portfolio[coin] = { amount: 0, avgprice: 0 }
    }

    const holding = state.portfolio[coin]

    const newAmount = holding.amount + amount

    holding.avgprice =
        ((holding.amount * holding.avgprice) + (amount * price)) / newAmount

    holding.amount = newAmount

    state.balance -= cost

    savePortfolio()

    state.trades.push({
    type: "buy",
    coin,
    amount,
    price,
    timestamp: Date.now()
});

    console.log("----------------------------------------------------")
    showAlert(`Bought ${amount} ${coin} at $${price}`,"success")
    // inside sell()
document.getElementById("coinInput").value = ""
document.getElementById("amountInput").value = ""
}

async function sell(coin, amount){
    if(amount<=0 || !Number.isFinite(amount)){
        showAlert("enter a valid amount","error");
        return
    }
    if(Object.keys(state.market).length === 0){
    showAlert("Market data not loaded yet","error")
    return
}
    coin = coin.toLowerCase()
    if(!state.portfolio[coin] || state.portfolio[coin].amount < amount){
        console.log("----------------------------------------------------")
        showAlert("Not enough coins","error")
        return
    }

    const price = state.market[coin].price
    const value = price * amount
    
    state.portfolio[coin].amount -= amount
    state.portfolio[coin].amount = Number(state.portfolio[coin].amount.toFixed(8))
    state.balance += value

    state.trades.push({
    type: "sell",
    coin,
    amount,
    price,
    timestamp: Date.now()
});
        if(state.portfolio[coin].amount < 1e-8){
    delete state.portfolio[coin]
}

 savePortfolio();
console.log("----------------------------------------------------")
    showAlert(`Sold ${amount} ${coin} at $${price}`,"success")
    // inside sell()
document.getElementById("coinInput").value = ""
document.getElementById("amountInput").value = ""
}

function portfolio(){
    if(!appReady){
        showAlert("App still loading market data...")
        return
    }
        console.log("----------------------------------------------------")
    console.log("Portfolio")
    // const totalValue = state.balance
    
    
    let totalValue = state.balance
for(let coin in state.portfolio){

    const amount = state.portfolio[coin].amount
    const price = state.market[coin]?.price || 0
    const value = amount * price
    const avgprice = state.portfolio[coin].avgprice || 0
    totalValue += value
    const pnl = (price - avgprice) * amount
    // console.log(coin, amount.toFixed(8), "value:", value.toFixed(2),"avg price: ",avgprice.toFixed(2),"Pnl:",pnl.toFixed(2))
}
// console.log("totalValue:",totalValue.toFixed(2));
//  const accountPnL = Number((totalValue - capital).toFixed(2))

// console.log("Balance:", state.balance.toFixed(2))
// console.log("Total Account Value:", totalValue.toFixed(2))


// if(accountPnL > 0){
//     console.log("Profit:", "+", accountPnL.toFixed(2))
// }
// else if(accountPnL < 0){
//     console.log("Loss:", "-", Math.abs(accountPnL).toFixed(2))
// }
// else{
//     console.log("No Profit No Loss")
// }

}
function calculatePortfolioSummary(state) {
    let totalCoinValue = 0;
    let totalCapital = 0;

    Object.entries(state.portfolio).forEach(([coin, holding]) => {
       const price = state.market[coin]?.price;

if (!price) {
    return; // skip rendering this coin
}

        const currentValue = holding.amount * price;
        const investedValue = holding.amount * holding.avgprice;

        totalCoinValue += currentValue;
        totalCapital += investedValue;
    });

    const totalValue = state.balance + totalCoinValue;
    const pnl = totalValue - initialBalance;
    let pnlPercent = 0;

if (initialBalance > 0) {
  pnlPercent = (pnl / initialBalance) * 100;
}

    return {
        totalValue,
        pnl,
        pnlPercent
    };
}


function exportPortfolio(){

    const formattedTrades = state.trades.map(t => ({
        ...t,
        time: new Date(t.timestamp).toLocaleString("en-IN")
    }));

    const data = {
        balance: state.balance,
        portfolio: state.portfolio,
        trades: formattedTrades,
        capital: initialBalance
    };
    const json = JSON.stringify(data,null,2)
    const blob = new Blob([json],{type:'application/json'})
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = "portfolio_save.txt"
a.click()
URL.revokeObjectURL(url)
}


const fileInput = document.getElementById("importfile");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    fileName.innerText = fileInput.files[0].name;
  } else {
    fileName.innerText = "No file";
  }
});
document.getElementById("importfile")
.addEventListener("change", importPortfolio)

async function importPortfolio(event){
    
    const file = event.target.files[0]
    if (!file) return;
    const reader = new FileReader()

    reader.onload = function(e){
        
        const data = JSON.parse(e.target.result)

        state.balance = data.balance
        state.portfolio = data.portfolio
        state.trades = data.trades || []

initialBalance = data.capital || data.balance  // ⭐ fallback safety

localStorage.setItem("capital", initialBalance)
document.getElementById("capitalInputBox").style.display = "none";
        localStorage.setItem("portfolio", JSON.stringify(data))
        refreshImportedCoins();

        renderPortfolio()
        updatePortfolioUI(state)
        event.target.value = ""
        showAlert("Portfolio restored","success")
        
    }

    reader.readAsText(file)
}
async function refreshImportedCoins() {
  for (const coin in state.portfolio) {
    if (!state.market[coin]) {
      await handleCoinSearch(coin); // reuse your search logic
    }
  }
}

function startPriceStream(){

    const symbols = Object.values(state.market)
        .map(c => c.symbol.toLowerCase() + "usdt")

    const streamURL =
    "wss://stream.binance.com:9443/stream?streams=" +
   symbols.map(s => `${s}@miniTicker`).join("/")

    const ws = new WebSocket(streamURL)

    ws.onopen = () => {
        console.log("Binance price stream connected")
    }

    ws.onmessage = (event) => {

        const msg = JSON.parse(event.data)
        if(!msg.data || !msg.data.s || !msg.data.c) return

        const symbol = msg.data.s.toLowerCase()   // BTCUSDT
        const price = Number(msg.data.c)

        const coinSymbol = symbol.replace("usdt","")

        for(const coin in state.market){

            if(state.market[coin].symbol === coinSymbol && state.market[coin].price !== price ){

                state.market[coin].price = price
                
                renderMarketList()
                safeUpdatePortfolioUI(state);
                renderPortfolio()
                refreshImportedCoins();
                break
            }
            
        }

    }

    ws.onerror = (err)=>{
        console.log("WebSocket error:",err)
        showAlert("WebSocket Error","error")
    }

    ws.onclose = ()=>{
        console.log("Stream disconnected. Reconnecting in 3s...")
        showAlert("Stream disconnected. Reconnecting in 3s...")
        setTimeout(startPriceStream,3000)
    }

}

// async function run(){
// loadPortfolio();
// await updateMarket();

// // await buy("bitcoin",0.1)
// // await sell("bitcoin",0.01)
// // await sell("bitcoin",0.01)
// // await sell("bitcoin",0.01)
// // await sell("bitcoin",0.01)
// // await sell("bitcoin",0.01)
// // await sell("bitcoin",0.01)

// }// await buy("solana",3)
// // await buy("ripple",10)
// // await sell("USDC",12)
// // await buy("bitcoin",120)



// run();

async function run(){

    console.log("Initializing app...")

    loadPortfolio()
    if (state.balance === 0) {
        showAlert("Set your capital to start trading", "error");
    }
    await updateMarket()
    renderMarketList()
    
    startPriceStream()
    appReady = true
//     const news = await fetchNews()
// console.log("NEWS:", news)
// renderNews(news)
    renderPortfolio()
    showAlert("App Ready","success")
    
}

run();