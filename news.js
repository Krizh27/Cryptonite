async function fetchNews() {
    try {
        const res = await fetch ("https://newsapi.org/v2/everything?q=crypto&sortBy=publishedAt&apiKey=edea3752487d472ab4c54c0e7c9c2905")
        
        console.log(res) // Response {type: 'cors', url: 'https://newsapi.org/v2/everything?q=crypto&sortBy=…blishedAt&apiKey=edea3752487d472ab4c54c0e7c9c2905', redirected: false, status: 200, ok: true, …}
        // console.log(res.json()) //Promise {<pending>}
        const data = await res.json()
        // console.log(data)
       
        //returns array of objects of articles 
        // console.log(data.articles)
        return data.articles;
    } catch (error) {
        console.log("error fetching news",error);
        return [];
    }
}


function renderNews(newslist){
    const container = document.getElementById("newsContainer");

    container.innerHTML = `
        <h2>Latest Crypto News</h2>
        <div class="news-grid" id="grid"></div>
    `;

    const grid = document.getElementById("grid");

    const defaultImage = "default.jpg";

    newslist.forEach(news => {
        const item = document.createElement("div");
        item.classList.add("news-card");

        const imageUrl = news.urlToImage || defaultImage;

        item.innerHTML = `
            <img src="${imageUrl}" alt="news image">
            <div class="news-content">
                <p><b>${news.title}</b></p>
                <a href="${news.url}" target="_blank">Read more →</a>
            </div>
        `;

        grid.appendChild(item);
    });
}

async function fetchNews(query = "crypto") {
    try {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&apiKey=edea3752487d472ab4c54c0e7c9c2905`);
        const data = await res.json();
        return data.articles;
    } catch (error) {
        console.log("error fetching news", error);
        return [];
    }
}

async function handleSearch() {
    const input = document.getElementById("searchInput");
    const query = input.value.trim();

    if (!query) return;

    const news = await fetchNews(query);
    renderNews(news);
}

document.getElementById("searchInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        handleSearch();
    }
});

async function runNews() {
    const news = await fetchNews()
    renderNews(news);
}
runNews();
// fetchNews()