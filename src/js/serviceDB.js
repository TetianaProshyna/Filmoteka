import libraryGalleryCardTmp from '../templates/library-gallery-card-tmp.hbs';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import Location from './location';

firebase.initializeApp({
  apiKey: 'AIzaSyDackmXMBWODCxMT-06RLPS-MR-Rxb5Ln0',
  authDomain: 'filmoteka-1e672.firebaseapp.com',
  projectId: 'filmoteka-1e672',
  storageBucket: 'filmoteka-1e672.appspot.com',
  messagingSenderId: '394531876680',
  appId: '1:394531876680:web:984811a42081c26d87cd7d',
});

export default class ServiceDB {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.watchBtn = document.querySelector('.data__modal__film-add-to-watched');
    this.queueBtn = document.querySelector('.data__modal__film-add-to-queue');
    this.watchBtnHeader = document.querySelector('.watch');
    this.queueBtnHeader = document.querySelector('.queue');
    this.galleryListRef = document.querySelector('[data-js="movie-gallery"]');
    this.libraryBtn = document.querySelector('[data-js="lib-btn"]');
    this.pageFooter = document.querySelector('[data-js="page-footer"]');
  }

  async getActualQueueLists(user) {
    //get info from user's collection
    const list = await this.db.collection('users').doc(user.uid).get();
    const actualListQueue = list.data().queue;
    this.renderGalleryOnBtnClick(actualListQueue);
    // this.queueBtnHeader.addEventListener(
    //   'click',
    //   this.renderGalleryOnBtnClick.bind(this, actualListQueue),
    // );
  }
  async getActualWatchedLists(user) {
    //get info from user's collection
    const list = await this.db.collection('users').doc(user.uid).get();
    const actualListWatched = list.data().watched;
    this.renderGalleryOnBtnClick(actualListWatched);

    if (actualListWatched.length === 0) {
      this.pageFooter.style.position = 'fixed';
    }

    // this.watchBtnHeader.addEventListener(
    //   'click',
    //   this.renderGalleryOnBtnClick.bind(this, actualListWatched),
    // );
  }

  renderGalleryOnBtnClick(actualItemsList) {
    this.galleryListRef.innerHTML = '';
    this.galleryListRef.insertAdjacentHTML(
      'afterbegin',
      libraryGalleryCardTmp(actualItemsList),
    );
    const genres = document.querySelectorAll('.card-genres');
    genres.forEach(el => {
      el.textContent = el.textContent.trim().split(' ').join(', ');
    });
    const years = document.querySelectorAll('.year-of-release');
    years.forEach(el => {
      el.textContent = el.textContent.trim().split('').splice(0, 4).join('');
    });
  }

  async changeWattchedList(user) {
    try {
      const watchedList = await this.db.collection('users').doc(user.uid).get();
      let newList = watchedList.data().watched;
      const newFilm = JSON.parse(this.watchBtn.dataset.ob);
      if (newList.some(e => e.id === newFilm.id)) {
        newList = newList.filter(e => e.id !== newFilm.id);
        this.watchBtn.textContent = 'ADD TO WATCHED';
        return newList;
      } else {
        newList.push(newFilm);
        this.watchBtn.textContent = 'REMOVE FROM WATCHED';
        return newList;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async changeQueueList(user) {
    const queueList = await this.db.collection('users').doc(user.uid).get();
    let newList = queueList.data().queue;
    const newFilm = JSON.parse(this.queueBtn.dataset.ob);
    if (newList.find(e => e.id === newFilm.id)) {
      newList = newList.filter(e => e.id !== newFilm.id);
      this.queueBtn.textContent = 'ADD TO QUEUE';
      return newList;
    } else {
      newList.push(newFilm);
      this.queueBtn.textContent = 'REMOVE FROM QUEUE';
      return newList;
    }
  }

  renewWatchedList(user) {
    this.watchBtn.addEventListener(
      'click',
      this.handleWatchBtnClick.bind(this, user),
    );
  }

  async handleWatchBtnClick(user) {
    const data = await this.changeWattchedList(user);
    this.db.collection('users').doc(user.uid).set(
      {
        watched: data,
      },
      { merge: true },
    );

    if (Location.isWatchedOpen()) {
      this.renderGalleryOnBtnClick(data);
    }
  }

  renewQueueList(user) {
    this.queueBtn.addEventListener(
      'click',
      this.handleQueueBtnClick.bind(this, user),
    );
  }

  async handleQueueBtnClick(user) {
    const data = await this.changeQueueList(user);
    this.db.collection('users').doc(user.uid).set(
      {
        queue: data,
      },
      { merge: true },
    );
    if (Location.isQueueOpen()) {
      this.renderGalleryOnBtnClick(data);
    }
  }

  showlogoutMessage(user) {
    const messageRef = document.querySelector('.login-message');
    if (!user) {
      messageRef.textContent = 'Please Login to see your library';
    }
  }
}
