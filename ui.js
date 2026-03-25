console.log("UI LOADED")


function renderPortfolio(){

    const table = document.querySelector("#portfolioTable tbody")
    table.innerHTML = ""

    for(const coin in state.portfolio){

        const holding = state.portfolio[coin]
        const price = state.market[coin]?.price || 0

        const value = holding.amount * price
        const pnl = (price - holding.avgprice) * holding.amount

        const row = document.createElement("tr")

        row.innerHTML = `
        <td>${coin}</td>
        <td>${holding.amount.toFixed(4)}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${value.toFixed(2)}</td>
        <td>${pnl.toFixed(2)}</td>
        `
        
        table.appendChild(row)
        row.onclick = () => {
        document.getElementById("coinInput").value = coin
    }
  
    }

    document.getElementById("balance").innerText =
    "Balance: $" + state.balance.toFixed(2)

}

function renderMarketList() {
    const headerContainer = document.getElementById("marketListHeader")
    const bodyContainer = document.getElementById("marketListBody")

    headerContainer.innerHTML = ""
    bodyContainer.innerHTML = ""

    // ✅ HEADER (fixed)
    const header = document.createElement("div")
    header.className = "market-row header-row"

    header.innerHTML = `
        <b>Rank</b>
        <b>Name</b>
        <b>Price</b>
        <b>24h High</b>
        <b>24h Low</b>
        <b>Updated</b>
    `

    headerContainer.appendChild(header)

    // ✅ BODY (scrollable)
    for (const coin in state.market) {
        const data = state.market[coin]

        const row = document.createElement("div")
        row.className = "market-row"

        const price = Number(data.price)
        const high = Number(data.high24h)
        const low = Number(data.low24h)

        row.innerHTML = `
            <span>${data.rank ?? "-"}</span>
            <span>
                <img src="${data.image}" width="20" height="20">
                ${data.name}
            </span>
            <span>$${Number.isFinite(price) ? price.toFixed(2) : "-"}</span>
            <span>$${Number.isFinite(high) ? high.toFixed(2) : "-"}</span>
            <span>$${Number.isFinite(low) ? low.toFixed(2) : "-"}</span>
            <span>${data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "-"}</span>
        `

        row.onclick = () => {
    document.getElementById("coinInput").value = coin
    renderCoinInfo(coin)

    const symbol = data.symbol.toUpperCase() // ✅ correct ticker
    loadChart(symbol)
}

        bodyContainer.appendChild(row)
    }
}
async function renderCoinInfo(coin) {
  const container = document.getElementById("coinInfoContainer");

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
    const data = await res.json();

    const website = data.links.homepage[0] || "#";
    const whitepaper = data.links.whitepaper || data.links.blockchain_site[0] || "#";

    const price = data.market_data.current_price.usd;
    const high = data.market_data.high_24h.usd;
    const low = data.market_data.low_24h.usd;
    const marketCap = data.market_data.market_cap.usd;
    const volume = data.market_data.total_volume.usd;
    const lastUpdated = data.market_data.last_updated;

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${data.image?.small || data.image || ''}" width="40" onerror="this.src='https://via.placeholder.com/40'">
        <h2>${data.name || "Unknown"} (${(data.symbol || "N/A").toUpperCase()})</h2>
      </div>

      <p>Price: $${Number.isFinite(price) ? price.toFixed(2) : "-"}</p>
      <p>Market Cap: $${Number.isFinite(marketCap) ? marketCap.toLocaleString() : "-"}</p>
      <p>24h High: $${Number.isFinite(high) ? high.toFixed(2) : "-"}</p>
      <p>24h Low: $${Number.isFinite(low) ? low.toFixed(2) : "-"}</p>
      <p>Volume: $${Number.isFinite(volume) ? volume.toLocaleString() : "-"}</p>
      <p>Last Updated: ${lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "-"}</p>

      <p>🔗 <a href="${website && website !== "#" ? website : "#"}" target="${website && website !== "#" ? "_blank" : ""}" ${!website || website === "#" ? "style=\"pointer-events:none; color:gray;\"" : ""}>Official Website</a></p>
      <p>📄 <a href="${whitepaper && whitepaper !== "#" ? whitepaper : "#"}" target="${whitepaper && whitepaper !== "#" ? "_blank" : ""}" ${!whitepaper || whitepaper === "#" ? "style=\"pointer-events:none; color:gray;\"" : ""}>Whitepaper</a></p>
    `;

  } catch (err) {
    container.innerHTML = "<h2>Error loading coin info</h2>";
    console.error(err);
  }
}

// function renderCoinInfo(coin) {
//     const container = document.getElementById("coinInfoContainer")

//     const data = state.market[coin]

//     if (!data) {
//         container.innerHTML = "<h2>Coin not found</h2>"
//         return
//     }

//     const price = Number(data.price)
//     const high = Number(data.high24h)
//     const low = Number(data.low24h)
//     const marketCap = Number(data.marketCap)
//     const volume = Number(data.volume)

// container.innerHTML = `
//     <div style="display:flex; align-items:center; gap:10px;">
//         <img src="${data.image}" width="40" height="40">
//         <h2>${data.name} (${data.symbol.toUpperCase()})</h2>
//     </div>

//     <p>Price: $${Number.isFinite(price) ? price.toFixed(2) : "-"}</p>
//     <p>24h High: $${Number.isFinite(high) ? high.toFixed(2) : "-"}</p>
//     <p>24h Low: $${Number.isFinite(low) ? low.toFixed(2) : "-"}</p>
//     <p>Market Cap: $${Number.isFinite(marketCap) ? marketCap.toLocaleString() : "-"}</p>
//     <p>Volume: $${Number.isFinite(volume) ? volume.toLocaleString() : "-"}</p>
//     <p>Last Updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "-"}</p>
// `
// }

// function renderNews(newsList) {
//     const container = document.querySelector(".news-section")

//     if (!newsList || newsList.length === 0) {
//         container.innerHTML = "<h2>No news available</h2>"
//         return
//     }

//     container.innerHTML = "<h2>Latest Crypto News</h2>"

//     newsList.slice(0, 10).forEach(news => {
//         const item = document.createElement("div")
//         item.className = "news-item"

//         item.innerHTML = `
//             <p><b>${news.title}</b></p>
//             <a href="${news.url}" target="_blank">Read more</a>
//         `

//         container.appendChild(item)
//     })
// }

document.addEventListener("click", (e) => {
  if (!e.target.closest(".menu-container")) {
    dropdown.classList.add("hidden");
  }
});

function buyCoin(){

    const coin = document.getElementById("coinInput").value
    const amount = Number(document.getElementById("amountInput").value)

    buy(coin, amount)

    renderPortfolio()
}

function sellCoin(){

    const coin = document.getElementById("coinInput").value
    const amount = Number(document.getElementById("amountInput").value)

    sell(coin, amount)

    renderPortfolio()
}
function showAlert(message, type = "success") {
    const box = document.getElementById("alertBox");

    const alert = document.createElement("div");
    alert.className = `alert ${type}`;
    alert.innerText = message;

    box.appendChild(alert);
    if (box.children.length > 3) {
    box.removeChild(box.firstChild);
}
    // remove after 3 sec
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
function updatePortfolioUI(state) {
    const summary = calculatePortfolioSummary(state);

    document.getElementById("totalValue").innerText =
        "$" + summary.totalValue.toFixed(2);

    const pnlEl = document.getElementById("totalPnL");

    pnlEl.innerText =
    (summary.pnl >= 0 ? "+" : "") +
    summary.pnl.toFixed(2) +
    " (" +
    summary.pnlPercent.toFixed(2) +
    "%)";

    if (summary.pnlPercent > 5) pnlEl.style.color = "lime";
else if (summary.pnlPercent > 0) pnlEl.style.color = "#90ee90";
else pnlEl.style.color = "red";

    // color logic
    // pnlEl.style.color = summary.pnl >= 0 ? "lime" : "red";
}




let lastUpdate = 0;


const stableCoins = ["USDT", "USDC", "BUSD", "DAI"];
const unsupportedCoins = ["PI"];

function loadChart(symbol) {
  symbol = symbol.toUpperCase(); // fix case issue

  const iframe = document.getElementById("chartFrame");
  const fallback = document.getElementById("chartFallback");

  // Stablecoins
  if (stableCoins.includes(symbol)) {
    iframe.src = "";
    fallback.innerText = `${symbol} is a stablecoin (≈ $1), chart not needed`;
    return;
  }

  // Unsupported coins
  if (unsupportedCoins.includes(symbol)) {
    iframe.src = "";
    fallback.innerText = `Chart not available for ${symbol}`;
    return;
  }

  // Valid coin
  fallback.innerText = ""; // clear old message

  iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BINANCE:${symbol}USDT&interval=60&theme=dark&style=1`;
}


window.addEventListener("DOMContentLoaded", () => {
  loadChart("BTC");
});


function safeUpdatePortfolioUI(state) {
    const now = Date.now();

    if (now - lastUpdate > 500) {
        updatePortfolioUI(state);
        lastUpdate = now;
    }
}
