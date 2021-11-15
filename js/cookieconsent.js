/*!
 * Copyright (c) 2018 Eclipse Foundation, Inc.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * Contributors:
 *   Christopher Guindon <chris.guindon@eclipse-foundation.org>
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import 'cookieconsent';

const eclipseFdnCookieConsent = (function (window, document) {
  window.addEventListener('load', function () {
    /**
     * Override revokeChoice()
     *
     * Avoid cookie resets when the user
     * clicks on cookie settings
     */
    window.cookieconsent.Popup.prototype.revokeChoice = function (preventOpen) {
      this.options.enabled = true;
      this.options.onRevokeChoice.call(this);
      if (!preventOpen) {
        this.autoOpen();
      }
      this.open();
    };

    /**
     * Add custom button to show cookie consent banner
     * when it exist.
     */
    document.addEventListener(
      'click',
      function (event) {
        // If the clicked element doesn't have the right selector, bail
        if (!event.target.classList.contains('toolbar-manage-cookies')) {
          return;
        }
        // Log the clicked element in the console
        const ccWindow = document.getElementsByClassName('cc-window');
        ccWindow[0].style.display = '';
        setTimeout(function () {
          ccWindow[0].classList.remove('cc-invisible');
        }, 20);
      },
      false
    );

    /**
     * Remove Cookies
     *
     * Remove cookies except whitelist
     */
    window.cookieconsent.Popup.prototype.removeCookies = function () {
      var whitelist = ['eclipse_cookieconsent_status', 'has_js'];
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var cookie_index = cookie.indexOf('=');
        var cookie_name =
          cookie_index > -1 ? cookie.substr(0, cookie_index) : cookie;
        cookie_name = cookie_name.trim();
        if (
          whitelist === undefined ||
          whitelist.length == 0 ||
          whitelist.indexOf(cookie_name) == -1
        ) {
          document.cookie =
            cookie_name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
        }
      }
    };

    /**
     * Helper function that hides the cc-revoke
     * when it's not needed
     */
    function hideShowCCRevokeButton() {
      // This button is not needed when a .toolbar-manage-cookies link is present
      // on the page.
      if (!document.getElementsByClassName('toolbar-manage-cookies').length) {
        document.getElementsByClassName('cc-revoke')[0].style.display = 'block';
      } else {
        document.getElementsByClassName('cc-revoke')[0].style.display = 'none';
      }
    }

    /**
     * Initialise cookieconsent
     */
    window.cookieconsent.initialise({
      type: 'opt-in',
      position: 'bottom',
      revokable: true,
      enabled: true,
      //animateRevokable: false,
      cookie: {
        name: 'eclipse_cookieconsent_status',
        expiryDays: 90,
        domain:
          '.' +
          location.hostname.split('.').reverse()[1] +
          '.' +
          location.hostname.split('.').reverse()[0],
      },
      compliance: {
        'opt-in':
          '<div class="cc-compliance cc-highlight">{{deny}}{{allow}}</div>',
      },
      onStatusChange: function (status, chosenBefore) {
        // Cookies are not allowed, delete them
        document.cookie =
          'eclipse_cookieconsent_status=' + status + '; expires=0; path=/;';
        if (status !== 'allow') {
          this.removeCookies();
        }
      },
      onPopupClose: function () {
        hideShowCCRevokeButton();
      },
      onInitialise: function (status, options) {
        setTimeout(function () {
          hideShowCCRevokeButton();
        });
      },
      revokeBtn: '<div class="cc-revoke {{classes}}">Cookie settings</div>',
      palette: {
        popup: {
          background: "#18325e",
          text: "#ffffff"
        },
        highlight: {
          background: "#fff",
          text: "#000000"
        }, 
        button: {
          background: "#5fa048",
          text: "#ffffff"
        }
      },
      content: {
        href: 'https://www.eclipse.org/legal/privacy.php',
        dismiss: 'Dismiss',
        link: 'click here.',
        message:
          'Some Eclipse Foundation pages use cookies to better serve you when you return to the site. You can set your browser to notify you before you receive a cookie or turn off cookies. If you do so, however, some areas of some sites may not function properly. To read Eclipse Foundation Privacy Policy',
      },
    });
  });
})(window, document);
export default eclipseFdnCookieConsent;
