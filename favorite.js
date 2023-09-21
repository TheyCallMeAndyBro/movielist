const BASE_URL = 'https://webdev.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/movies/'
const POSTER_URL = BASE_URL + 'posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []   //放回傳隨來的陣列
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


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
                <button class="btn btn-danger btn-remove-favorite" data-id='${item.id}' >X</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
  })


  dataPanel.innerHTML = rawHTML
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



function removeFavorite(id) {

  if (!movies || !movies.length) {
    return
  }

  const movieIndex = movies.findIndex(movie => { return movie.id === id })    //find() 裡面放置函示

  if (movieIndex === -1) {
    return
  }

  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))    //value為 list  經過前面用id 回傳回來的整個電影陣列

  renderMovieList(movies)

}

//More 跟 + 按鈕監聽器
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    //dataset裡面的元素皆為字串要更改成數值
  }
  else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)

