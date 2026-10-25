(function () {
  'use strict';

  const API_URL = 'https://jsonplaceholder.typicode.com/posts';
  const COMMENTS_URL = 'https://jsonplaceholder.typicode.com/comments';
  const PAGE_SIZE = 10;
  const TOTAL_POSTS = 100;
  const DEBOUNCE_DELAY = 300;

  class PostModel {
    constructor() {
      this.posts = [];
      this.filter = '';
      this.loadedCount = 0;
      this.isLoading = false;
      this.isComplete = false;
      this.commentsCache = new Map();
    }

    async loadMore() {
      if (this.isLoading || this.isComplete) {
        return { ok: true, data: [], skipped: true };
      }

      this.isLoading = true;

      try {
        const url = `${API_URL}?_start=${this.loadedCount}&_limit=${PAGE_SIZE}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Сервер вернул ошибку ${response.status}`);
        }

        const data = await response.json();

        this.loadedCount += data.length;
        this.posts = this.posts.concat(data);

        if (this.loadedCount >= TOTAL_POSTS || data.length === 0) {
          this.isComplete = true;
        }

        return { ok: true, data };
      } catch (err) {
        return {
          ok: false,
          error: 'Не удалось загрузить посты. Проверьте подключение к интернету и попробуйте ещё раз.',
          details: err.message,
        };
      } finally {
        this.isLoading = false;
      }
    }

    async loadComments(postId) {
      if (this.commentsCache.has(postId)) {
        return { ok: true, data: this.commentsCache.get(postId) };
      }

      try {
        const response = await fetch(`${API_URL}/${postId}/comments`);
        if (!response.ok) {
          throw new Error(`Сервер вернул ошибку ${response.status}`);
        }
        const data = await response.json();
        this.commentsCache.set(postId, data);
        return { ok: true, data };
      } catch (err) {
        return {
          ok: false,
          error: 'Не удалось загрузить комментарии. Проверьте подключение и попробуйте ещё раз.',
          details: err.message,
        };
      }
    }

    async addComment(postId, name, text) {
      try {
        const response = await fetch(COMMENTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ postId, name, body: text }),
        });
        if (!response.ok) {
          throw new Error(`Сервер вернул ошибку ${response.status}`);
        }
        const saved = await response.json();

        const comment = {
          postId,
          id: `own-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name || 'Вы',
          email: 'ваш ответ',
          body: text,
          own: true,
        };
        const list = this.commentsCache.get(postId) || [];
        this.commentsCache.set(postId, list.concat(comment));
        return { ok: true, data: comment };
      } catch (err) {
        return {
          ok: false,
          error: 'Не удалось отправить ответ. Попробуйте ещё раз.',
          details: err.message,
        };
      }
    }

    deleteComment(postId, commentId) {
      const list = this.commentsCache.get(postId) || [];
      const target = list.find((c) => c.id === commentId);
      if (!target || !target.own) return false;
      this.commentsCache.set(postId, list.filter((c) => c.id !== commentId));
      return true;
    }

    getPostById(id) {
      return this.posts.find((post) => post.id === id);
    }

    setFilter(text) {
      this.filter = String(text || '').trim().toLowerCase();
    }

    getVisiblePosts() {
      if (!this.filter) return this.posts;
      return this.posts.filter((post) =>
        post.title.toLowerCase().includes(this.filter)
      );
    }

    hasMore() {
      return !this.isComplete;
    }
  }

  class PostView {
    constructor() {
      this.container = document.getElementById('posts-container');
      this.loader = document.getElementById('loader');
      this.error = document.getElementById('error');
      this.errorText = document.getElementById('error-text');
      this.errorRetry = document.getElementById('error-retry');
      this.endMessage = document.getElementById('end-message');
      this.searchInput = document.getElementById('search-input');
      this.searchStatus = document.getElementById('search-status');
      this.sentinel = document.getElementById('sentinel');

      this.dialog = document.getElementById('post-dialog');
      this.dialogClose = document.getElementById('dialog-close');
      this.dialogPost = document.getElementById('dialog-post');
      this.commentsTitle = document.getElementById('comments-title');
      this.commentsLoader = document.getElementById('comments-loader');
      this.commentsError = document.getElementById('comments-error');
      this.commentsErrorText = document.getElementById('comments-error-text');
      this.commentsRetry = document.getElementById('comments-retry');
      this.commentsList = document.getElementById('comments-list');
      this.form = document.getElementById('comment-form');
      this.nameField = document.getElementById('comment-name');
      this.textField = document.getElementById('comment-text');
      this.submitBtn = document.getElementById('comment-submit');
      this.formStatus = document.getElementById('comment-status');
    }

    createAvatar(userId) {
      const avatar = document.createElement('div');
      avatar.className = 'post-card__avatar';
      avatar.style.background = `hsl(${(userId * 47) % 360}, 45%, 36%)`;
      avatar.textContent = `U${userId}`;
      avatar.setAttribute('aria-hidden', 'true');
      return avatar;
    }

    fillHighlighted(element, text, filter) {
      element.textContent = '';
      const index = filter ? text.toLowerCase().indexOf(filter) : -1;
      if (index === -1) {
        element.textContent = text;
        return;
      }
      const mark = document.createElement('mark');
      mark.textContent = text.slice(index, index + filter.length);
      element.append(
        text.slice(0, index),
        mark,
        text.slice(index + filter.length)
      );
    }

    renderPosts(posts, filter = '') {
      this.container.innerHTML = '';

      if (posts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'end-message';
        empty.textContent = filter
          ? `По запросу «${filter}» ничего не найдено среди загруженных постов`
          : 'Ничего не найдено';
        this.container.appendChild(empty);
        return;
      }

      const fragment = document.createDocumentFragment();

      for (const post of posts) {
        const card = document.createElement('article');
        card.className = 'post-card';
        card.dataset.id = post.id;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Открыть пост: ${post.title}`);

        const title = document.createElement('h2');
        title.className = 'post-card__title';
        this.fillHighlighted(title, post.title, filter);

        const body = document.createElement('p');
        body.className = 'post-card__body';
        body.textContent = post.body;

        const meta = document.createElement('div');
        meta.className = 'post-card__meta';
        const info = document.createElement('span');
        info.textContent = `Автор: userId ${post.userId}, пост #${post.id}`;
        const more = document.createElement('span');
        more.className = 'post-card__more';
        more.textContent = 'Читать и комментировать';
        meta.append(info, more);

        card.append(this.createAvatar(post.userId), title, body, meta);
        fragment.appendChild(card);
      }

      this.container.appendChild(fragment);
    }

    showLoader() {
      this.loader.classList.remove('hidden');
    }

    hideLoader() {
      this.loader.classList.add('hidden');
    }

    showError(message) {
      this.errorText.textContent = message;
      this.error.classList.remove('hidden');
    }

    hideError() {
      this.error.classList.add('hidden');
      this.errorText.textContent = '';
    }

    showEndMessage() {
      this.endMessage.classList.remove('hidden');
    }

    hideEndMessage() {
      this.endMessage.classList.add('hidden');
    }

    setSearchStatus(text) {
      this.searchStatus.textContent = text;
    }

    getSearchValue() {
      return this.searchInput.value;
    }

    onSearchInput(handler) {
      this.searchInput.addEventListener('input', handler);
    }

    onRetry(handler) {
      this.errorRetry.addEventListener('click', handler);
    }

    onPostOpen(handler) {
      const open = (event) => {
        const card = event.target.closest('.post-card');
        if (card) handler(Number(card.dataset.id));
      };
      this.container.addEventListener('click', open);
      this.container.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(event);
        }
      });
    }

    getSentinel() {
      return this.sentinel;
    }

    openPost(post) {
      this.dialogPost.innerHTML = '';

      const author = document.createElement('div');
      author.className = 'dialog__author';
      const authorText = document.createElement('span');
      authorText.textContent = `Автор: userId ${post.userId}, пост #${post.id}`;
      author.append(this.createAvatar(post.userId), authorText);

      const title = document.createElement('h2');
      title.id = 'dialog-title';
      title.className = 'dialog__title';
      title.textContent = post.title;

      const body = document.createElement('p');
      body.className = 'dialog__body';
      body.textContent = post.body;

      this.dialogPost.append(author, title, body);

      this.commentsList.innerHTML = '';
      this.commentsTitle.textContent = 'Комментарии';
      this.hideCommentsError();
      this.form.reset();
      this.setFormStatus('');

      document.body.classList.add('no-scroll');
      if (!this.dialog.open) this.dialog.showModal();
      this.dialog.scrollTop = 0;
    }

    closePost() {
      if (this.dialog.open) this.dialog.close();
    }

    onDialogClose(handler) {
      this.dialogClose.addEventListener('click', () => this.closePost());
      this.dialog.addEventListener('click', (event) => {
        if (event.target === this.dialog) this.closePost();
      });
      this.dialog.addEventListener('close', () => {
        document.body.classList.remove('no-scroll');
        handler();
      });
    }

    showCommentsLoader() {
      this.commentsLoader.classList.remove('hidden');
    }

    hideCommentsLoader() {
      this.commentsLoader.classList.add('hidden');
    }

    showCommentsError(message) {
      this.commentsErrorText.textContent = message;
      this.commentsError.classList.remove('hidden');
    }

    hideCommentsError() {
      this.commentsError.classList.add('hidden');
      this.commentsErrorText.textContent = '';
    }

    renderComments(comments) {
      this.commentsList.innerHTML = '';
      this.commentsTitle.textContent = `Комментарии (${comments.length})`;

      if (comments.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'comments__empty';
        empty.textContent = 'Пока никто не ответил. Станьте первым.';
        this.commentsList.appendChild(empty);
        return;
      }

      const fragment = document.createDocumentFragment();
      for (const comment of comments) {
        fragment.appendChild(this.createCommentItem(comment));
      }
      this.commentsList.appendChild(fragment);
    }

    createCommentItem(comment) {
      const item = document.createElement('li');
      item.className = comment.own ? 'comment comment--own' : 'comment';

      const head = document.createElement('div');
      head.className = 'comment__head';
      const name = document.createElement('span');
      name.className = 'comment__name';
      name.textContent = comment.name;
      const email = document.createElement('span');
      email.className = 'comment__email';
      email.textContent = comment.email;
      head.append(name, email);

      if (comment.own) {
        item.dataset.id = comment.id;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'comment__delete';
        del.textContent = 'Удалить';
        del.setAttribute('aria-label', `Удалить ваш комментарий: ${comment.body.slice(0, 30)}`);
        head.appendChild(del);
      }

      const body = document.createElement('p');
      body.className = 'comment__body';
      body.textContent = comment.body;

      item.append(head, body);
      return item;
    }

    onCommentDelete(handler) {
      this.commentsList.addEventListener('click', (event) => {
        const btn = event.target.closest('.comment__delete');
        if (!btn) return;
        handler(btn.closest('.comment').dataset.id);
      });
    }

    appendComment(comment, total) {
      const empty = this.commentsList.querySelector('.comments__empty');
      if (empty) empty.remove();
      const item = this.createCommentItem(comment);
      this.commentsList.appendChild(item);
      this.commentsTitle.textContent = `Комментарии (${total})`;
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    onCommentsRetry(handler) {
      this.commentsRetry.addEventListener('click', handler);
    }

    onCommentSubmit(handler) {
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        handler(this.nameField.value.trim(), this.textField.value.trim());
      });
    }

    setFormBusy(isBusy) {
      this.submitBtn.disabled = isBusy;
      this.submitBtn.textContent = isBusy ? 'Отправляем…' : 'Ответить';
    }

    setFormStatus(text, isError = false) {
      this.formStatus.textContent = text;
      this.formStatus.classList.toggle('is-error', isError);
    }

    resetForm() {
      this.textField.value = '';
    }
  }

  class PostController {
    constructor(model, view) {
      this.model = model;
      this.view = view;
      this.debounceTimer = null;
      this.observer = null;
      this.currentPostId = null;
    }

    async init() {
      this.view.onSearchInput(() => this.handleSearchInput());
      this.view.onRetry(() => this.loadNextPortion());
      this.view.onPostOpen((id) => this.openPost(id));
      this.view.onDialogClose(() => { this.currentPostId = null; });
      this.view.onCommentsRetry(() => this.loadComments());
      this.view.onCommentSubmit((name, text) => this.submitComment(name, text));
      this.view.onCommentDelete((commentId) => this.removeComment(commentId));

      this.setupInfiniteScroll();
      await this.loadNextPortion({ resetList: true });
    }

    handleSearchInput() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const text = this.view.getSearchValue();
        this.model.setFilter(text);
        this.refreshList();
      }, DEBOUNCE_DELAY);
    }

    refreshList() {
      const visible = this.model.getVisiblePosts();
      this.view.renderPosts(visible, this.model.filter);

      this.view.setSearchStatus(
        this.model.filter
          ? `Найдено: ${visible.length} из ${this.model.posts.length}`
          : ''
      );

      if (!this.model.hasMore() && !this.model.filter) {
        this.view.showEndMessage();
      } else {
        this.view.hideEndMessage();
      }
    }

    async loadNextPortion({ resetList = false } = {}) {
      if (this.model.isLoading || (!resetList && !this.model.hasMore())) {
        return;
      }

      this.view.showLoader();
      this.view.hideError();

      const result = await this.model.loadMore();

      this.view.hideLoader();

      if (!result.ok) {
        this.view.showError(result.error);
        console.error('[PostController]', result.details);
        return;
      }

      if (result.data.length > 0 || resetList) {
        this.refreshList();
      }

      if (!this.model.hasMore()) {
        this.view.showEndMessage();
        this.disconnectObserver();
        return;
      }

      requestAnimationFrame(() => this.fillScreenIfNeeded());
    }

    fillScreenIfNeeded() {
      const rect = this.view.getSentinel().getBoundingClientRect();
      if (rect.top <= window.innerHeight + 200) {
        this.loadNextPortion();
      }
    }

    setupInfiniteScroll() {
      const sentinel = this.view.getSentinel();

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.loadNextPortion();
          }
        },
        {
          rootMargin: '0px 0px 200px 0px',
          threshold: 0,
        }
      );

      this.observer.observe(sentinel);
    }

    disconnectObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }

    openPost(id) {
      const post = this.model.getPostById(id);
      if (!post) return;

      this.currentPostId = id;
      this.view.openPost(post);
      this.loadComments();
    }

    async loadComments() {
      const postId = this.currentPostId;
      if (postId === null) return;

      this.view.hideCommentsError();
      this.view.showCommentsLoader();

      const result = await this.model.loadComments(postId);

      if (postId !== this.currentPostId) return;

      this.view.hideCommentsLoader();

      if (!result.ok) {
        this.view.showCommentsError(result.error);
        console.error('[PostController]', result.details);
        return;
      }

      this.view.renderComments(result.data);
    }

    removeComment(commentId) {
      const postId = this.currentPostId;
      if (postId === null) return;

      if (this.model.deleteComment(postId, commentId)) {
        this.view.renderComments(this.model.commentsCache.get(postId));
        this.view.setFormStatus('Комментарий удалён');
      }
    }

    async submitComment(name, text) {
      const postId = this.currentPostId;
      if (postId === null || !text) {
        this.view.setFormStatus('Напишите текст ответа', true);
        return;
      }

      this.view.setFormBusy(true);
      this.view.setFormStatus('');

      const result = await this.model.addComment(postId, name, text);

      this.view.setFormBusy(false);

      if (!result.ok) {
        this.view.setFormStatus(result.error, true);
        console.error('[PostController]', result.details);
        return;
      }

      if (postId !== this.currentPostId) return;

      const total = this.model.commentsCache.get(postId).length;
      this.view.appendComment(result.data, total);
      this.view.resetForm();
      this.view.setFormStatus('Ответ добавлен (сервер-заглушка его не сохраняет)');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const model = new PostModel();
    const view = new PostView();
    const controller = new PostController(model, view);
    controller.init();
  });
})();