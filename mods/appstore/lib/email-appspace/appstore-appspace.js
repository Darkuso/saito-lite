const AppStoreAppspaceTemplate = require('./appstore-appspace.template.js');
const AppStoreAppspacePublish = require('./appstore-appspace-publish/appstore-publish.js');
const AppStoreAppBoxTemplate = require('./appstore-app-box.template.js');
const AppStoreAppCategoryTemplate = require('./appstore-app-category.template.js');
const AppStoreAppDetails = require('./appstore-app-details/appstore-app-details.js');


module.exports = AppStoreAppspace = {

  render(app, data) {


    document.querySelector(".email-appspace").innerHTML = AppStoreAppspaceTemplate();


    //
    // fetch modules from appstore
    //
    data.appstore.sendPeerDatabaseRequest(
      "appstore", "modules", "name, description, version, publickey, unixtime, bid, bsh",
      "featured = 1",
      null,
      (res) => {
        if (res.rows != undefined) {
          this.addCategories(app, data, res.rows);
          this.populateAppsSpace(app, data, res.rows);
        }

      });

    //
    // load some categories
    //
    //document.querySelector(".appstore-browse-list").innerHTML += AppStoreAppCategoryTemplate({});

  },

  addCategories(app, data, rows) {
    var allCategories = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].categories) {
        let categories = rows[i].categories.split(" ")
        categories.forEach((item) => {
          if (!allCategories.includes(item)) {
            allCategories.push(item);
          }
        });
      }
    }
    let allCategoriesHTML = allCategories.map((category) => {
      return `<div class="app-category-checkbox app-category-${category}">
                <label class="s-container">${category}
                  <input type="checkbox" name="app-${category}" id="app-${category}" />
                  <span class="s-checkmark"></span>
                </label>
              </div>
                `;
    }).sort().join("");
    document.querySelector(".appstore-categories").innerHTML = allCategoriesHTML;
    this.attachEventstoCategories(app, data, rows);
  },

  attachEventstoCategories(app, data, rows) {
    document.querySelector("#app-all").onclick = (e) => {
      let categories = [];
      document.querySelectorAll(".appstore-categories input").forEach((el) => {
        el.checked = document.querySelector("#app-all").checked;
        categories.push(el.id.split("-")[1]);
      });
      AppStoreAppspace.populateAppsSpace(app, data, rows, categories);
    }
    document.querySelectorAll(".appstore-categories input").forEach((el) => {
      el.onclick = function() {
        var toCheckAll = false;
        var categories = [];
        document.querySelectorAll(".appstore-categories input").forEach((el) => {
          if (el.checked) {
            toCheckAll = false;
            categories.push(el.id.split("-")[1]);
          }
        });
        document.querySelector("#app-all").checked = toCheckAll;
        AppStoreAppspace.populateAppsSpace(app, data, rows, categories);
      }
    });
  },

  populateAppsSpace(app, data, rows, categories = "") {

  document.querySelector(".appstore-app-list").innerHTML = "";
  for (let i = 0; i < rows.length; i++) {
    if (!categories || categories.some(item => rows[i].categories.includes(item))) {
      if (rows[i].categories) {
        rows[i].categoriesHTML = rows[i].categories.split(" ").map((category) => {
          return `<div class="category">${category}</div>`;
        }).join("");
      }
      document.querySelector(".appstore-app-list").innerHTML += AppStoreAppBoxTemplate(app, rows[i]);
    }
  }

  this.attachEventsToModules(app, data);
  
  },


  attachEventsToModules(app, data) {

    //
    // install module (button)
    //
    Array.from(document.getElementsByClassName("appstore-app-install-btn")).forEach(installbtn => {

      installbtn.onclick = (e) => {

        let module_obj = JSON.parse(app.crypto.base64ToString(e.currentTarget.id));
        data.module = module_obj;
        AppStoreAppDetails.render(app, data);
        AppStoreAppDetails.attachEvents(app, data);

      };
    });
  },


  attachEvents(app, data) {


    //
    // publish apps
    //
    document.getElementById('appstore-publish-button').onclick = () => {
      AppStoreAppspacePublish.render(app, data);
      AppStoreAppspacePublish.attachEvents(app, data);
    }


    //
    // search box
    //
    document.getElementById('appstore-search-box').addEventListener('click', (e) => {
      e.currentTarget.placeholder = "";
      e.currentTarget.value = "";
    });


    document.getElementById('appstore-search-box').addEventListener('keypress', (e) => {
      let key = e.which || e.keyCode;
      if (key === 13) {

        alert("Search Query: " + e.currentTarget.value);

        var message = {};
        message.request = "appstore search modules";
        message.data = e.currentTarget.value;

        app.network.sendRequestWithCallback(message.request, message.data, (res) => {
          if (res.rows != undefined) {
            this.populateAppsSpace(app, data, res.rows);
          }
        });
      }
    });
  }

}
