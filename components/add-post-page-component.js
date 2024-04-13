import { sanitizeHtml } from "../helpers.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";


let imageUrl = "";
export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  const render = () => {
    // TODO: Реализовать страницу добавления поста
    const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="add-form">
      <h2 class="add-form__title">Новый пост</h2>
      <div class="upload-image-container"></div>
      <label>
      Опишите фотографию:
      <br>
      <textarea class="add-form__text" type="textarea" rows="7"></textarea>
      </label>
      <button class="button" id="add-button">Добавить</button>
    </div>
  `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });
    renderUploadImageComponent({
      element: appEl.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert('Выберите фото');
        return;
      };
      if (!(document.querySelector(".add-form__text").value)) {
        alert('Не заполнено описание фото');
        return;
      };

      const description = document.querySelector(".add-form__text").value

      onAddPostClick({
        description: sanitizeHtml(description),
        imageUrl: imageUrl,
      });
    });
  };

  render();
}
