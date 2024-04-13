import { fetchPostsUser, getPosts, userPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
function getAPI() {
  return getPosts({ token: getToken() })
    .then((newPosts) => {
      if (newPosts && newPosts.length > 0) {
        page = POSTS_PAGE;
        posts = newPosts;
        renderApp();
      } else {
        goToPage(ADD_POSTS_PAGE);
        console.log("Нет постов");

      }
    })
    .catch((error) => {
      console.error(error);
      goToPage(POSTS_PAGE);
    });
}

export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      // Если пользователь не авторизован, то отправляем его на авторизацию перед добавлением поста
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    else if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      return getAPI();
    }

    else if (newPage === USER_POSTS_PAGE) {
      // TODO: реализовать получение постов юзера из API
      console.log("Открываю страницу пользователя: ", data.userId);
      page = LOADING_PAGE;
      renderApp();

      return fetchPostsUser(data.userId, { token: getToken() })
        .then((newPosts) => {
          page = USER_POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
        });
    }
    else {
      page = newPage;
      renderApp();
      return;
    }

  }

  throw new Error("Cтраницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        // TODO: реализовать добавление поста в API
        console.log("Добавляю пост...", { description, imageUrl });
        userPosts({ token: getToken(), description, imageUrl })
          .then(() => {
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            if (error.message === "Сервер упал") {
              alert("Сервер сломался, попробуйте позже");
              postPosts({ token: getToken(), description, imageUrl });
            } else {
              alert('Кажется, у вас не работает интернет, попробуйте позже');
              console.log(error);
            }
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl, userView: false,
    });
  }

  if (page === USER_POSTS_PAGE) {
    // TODO: реализовать страницу фотографию пользвателя
    appEl.innerHTML = "Здесь будет страница фотографий пользователя";
    return renderPostsPageComponent({
      appEl, userView: true,
    });
  }
};

goToPage(POSTS_PAGE);
