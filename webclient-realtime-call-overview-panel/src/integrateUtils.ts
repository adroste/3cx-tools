import { goTo } from './history';

export function getLanguage() {
  const lang = localStorage.getItem('wc.language');
  return lang ? JSON.parse(lang) : null;
}

export function setValueOfAngularInput(domElement: HTMLInputElement, value: any) {
  domElement.value = value;
  // triggers validation of field value on angular side
  // see: https://angular.io/guide/forms-overview#testing-reactive-forms
  domElement.dispatchEvent(new Event('input'));
}

export function removeSearchParamsFromUrl(url: string) {
  const pos = url.indexOf('?');
  if (pos !== -1)
    return url.slice(0, pos);
  return url;
}

export function makeCall(phoneNumber: string) {
  // check if dialer is already open, otherwise simulate click to open it
  if (document.querySelector('app-web-dialer')!.clientWidth === 0) 
    document.querySelector('#menuDialer')!.dispatchEvent(new Event('click'));
  setTimeout(() => {
    setValueOfAngularInput(document.querySelector('#dialpad-input')!, phoneNumber);
  }, 500);
}

export function editContact(id: string) {
  goTo(`#/contacts/edit/1/${id}`);
}

export function addContact(phoneNumber: string) {
  goTo('#/contacts');
  setTimeout(() => {
    document.querySelector('#btnAdd')!.dispatchEvent(new Event('click'));
    setTimeout(() => {
      setValueOfAngularInput(document.querySelector('#fieldMobile input')!, phoneNumber);
    }, 500);
  }, 500);
}