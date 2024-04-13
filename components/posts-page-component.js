import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken } from "../index.js";
import { getDislike, getLike } from "../api.js";

export function renderPostsPageComponent({ appEl, userView }) {
  // TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  let postsHtml = posts.map((post) => {
    return `              
                  <li class="post">
                    <div class="post-header" data-user-id=${post.user.id}>
                        <img src=${post.user.imageUrl} class="post-header__user-image">
                        <p class="post-header__user-name">${post.user.name}</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src=${post.imageUrl}>
                    </div>
                    <div class="post-likes">
                      <button data-post-id=${post.id} data-liked="${post.isLiked}" class="like-button">
                      ${post.isLiked ? `<img src="./assets/images/like-active.svg"></img>` : `<img src="./assets/images/like-not-active.svg"></img>`}
                      </button>
                      <p class="post-likes-text">
                        Нравится: <strong>
                        ${post.likes.length === 0 ? 0 : post.likes.length === 1 ? post.likes[0].name : post.likes[(post.likes.length - 1)].name + ' и еще ' + (post.likes.length - 1)}
                        </strong>
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${post.user.name}</span>
                      ${post.description}
                    </p>
                    <p class="post-date">
                      19 минут назад
                    </p>
                  </li>
                  
                
              </div>`


  }).join("");

  const appHtml = `
  <div class="page-container">
    <div class="header-container"></div>
    <ul class="posts">
    ${postsHtml}
    </ul>
  </div>`;
  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });

  }
  function getLikePost() {
    const likesButtons = document.querySelectorAll('.like-button');

    likesButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();

        const id = button.dataset.postId;
        const isLiked = button.dataset.liked; 
        const index = posts.findIndex((post) => post.id === id); 
        console.log(id);
        console.log(isLiked);
        console.log(index);
        if (index === -1) {
          console.error("Ошибка: пост не найден");
          return;
        }

        if (isLiked === 'false') {
          getLike(id, { token: getToken() })
            .then((updatedPost) => {
              const newPage = userView ? USER_POSTS_PAGE : POSTS_PAGE;
              goToPage(newPage, { userId: posts[0].user.id });
              // goToPage(POSTS_PAGE);
            })
            .catch((error) => {
              console.error("Ошибка при добавлении лайка:", error);
            });
        } else {
          getDislike(id, { token: getToken() })
            .then((updatedPost) => {
              const newPage = userView ? USER_POSTS_PAGE : POSTS_PAGE;
              goToPage(newPage, { userId: posts[0].user.id });
            })
            .catch((error) => {
              console.error("Ошибка при удалении лайка:", error);
            });
        }
      });
    });
  }
  getLikePost();

}



