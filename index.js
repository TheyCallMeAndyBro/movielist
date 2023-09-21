const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/movies/'
const POSTER_URL = BASE_URL + 'posters/'
const MOVIES_PER_PAGE = 12

const movies = []    //放回傳隨來的陣列
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


//修改電影清單內容
function renderMovieList(data) {
  let rawHTML = ''

  //這裡的data為movies 下方代入此函式的值
  data.forEach(item => {
    // title, image
    rawHTML += `
          <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id='${item.id}' >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page ='${page}'>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#move-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#move-modal-date')
  const modalDescription = document.querySelector('#move-modal-description')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results

    // console.log(data);

    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description

    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid">
    `

  })
}

//將使用者 + 的內容存取 
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []    //key為favoriteMovies 這邊自己設置

  const movie = movies.find(movie => { return movie.id === id })    //find() 裡面放置函示
  if (list.some(movie => { return movie.id === id })) {
    return alert('此電影已存在收藏清單中')
  }
  list.push(movie)    //點擊第一次後存進去movie資料存進 list裡面(localStorage)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))    //value為 list  經過前面用id 回傳回來的整個電影陣列

}
// localStorage.setItem('default_language', 'english')    //value 只能放string 想要放別的東西 只能透過 json.parse的方式轉回js的object
// localStorage.getItem('default_language')   //由key 查詢到 value
// localStorage.removeItem('default_language') //刪除key


//More 跟 + 按鈕監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {

  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //dataset裡面的元素皆為字串要更改成數值
  }
  else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//search bar 按鈕監聽器
searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault() //讓瀏覽器停止重新刷新
  const keyword = searchInput.value.trim().toLowerCase()   //trim()去頭去尾   toLowerCase()都變成小寫
  //放置搜尋完的結果
  // console.log(movies)

  //方法1 name.filter() 原本陣列中有包含()的內容才會留下來
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))
  //movie => movie.title.toLowerCase().includes(keyword)
  //movie => {return movie.title.toLowerCase().includes(keyword) }    兩個是一樣的匿名函式 上面那個省略return

  // //方法2 forEach
  // movies.forEach(movie => {                               //也可用for...of寫法
  //   if(movie.title.toLowerCase().includes(keyword)){      //如果movie陣列中的title與keyword的關鍵字一樣 
  //     filteredMovies.push(movie)                          //把movie的該陣列推進去filteredMovies中
  //   }
  // })

  // if (!keyword.length) {                         //如果輸入空字串 顯示alert('Please enter a valid string')
  //   return alert('Please enter a valid string')  //alert()警示框功能
  // }
  console.log(filteredMovies)            //當使用者沒有輸入任何關鍵字時，畫面顯示全部電影 ( 在 include () 中傳入空字串，所有項目都會通過篩選）
  if (filteredMovies.length === 0) {               
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`) //當使用者輸入的關鍵字找不到符合條件的項目時，跳出提示
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))   //顯示第一頁搜尋結果
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') {      //'A' => <a></a>
    return
  }

  const page = Number(event.target.dataset.page)

  renderMovieList(getMoviesByPage(page))  //資料做分頁

})


//透過收到page 顯示頁面的12筆資料
function getMoviesByPage(page) {
  // page 1 => 0 ~ 11
  // page 2 => 12 ~ 23
  // page 3 => 24 ~ 35
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

axios.get(INDEX_URL).then(response => {
  //方法1  for of用法
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  // console.log(movies)

  //方法2   forEach用法
  // response.data.results.forEach(movie => {
  //   // if (!movies.includes(response.data.results)) {   //可不寫
  //     movies.push(movie)
  //   // }
  // })
  // console.log(movies)

  // 方法3 ...用法
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))   //顯示預設載入第一頁搜尋結果   //資料做分頁
})

