import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  isLeafletMapPresent(): Promise<boolean> {
    return element(by.css('#map')).isPresent() as Promise<boolean>;
  }
}
