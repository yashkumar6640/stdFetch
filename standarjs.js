(function() {
  function initApplication() {
    
    var instance;
    var stdlib = {};
    stdlib = {
      components: {},
      templates: {},
      utility: {
        js_file_location: "app/components/",
        html_file_location: "app/components/",
        css_file_location: "app/components"
      },

      loadHtmlFile: function(html_url, element, page, selector) {
        var req, target;
        req = new XMLHttpRequest();
        req.open("GET", html_url, false);
        req.send(null);
        element.innerHTML = req.responseText;
        this.templates[page] = element.innerHTML;
      },

      loadCssFile: function(css_url, element, page, selector) {
        var css, head, script_selector;
        script_selector = `script[src="${css_url}"]`;
        if (!document.querySelector(script_selector)) {
          css_elem = document.createElement("link");
          css_elem.src = css_url;
          css_elem.setAttribute("rel", "stylesheet");

          head = document.querySelector("head");
          head.appendChild(css_elem);
        }
      },

      loadJsFile: function(js_url, element, page, selector) {
        var comp_loaded_function_called = false;
        var js_elem;
        scriptSelector = `script[src="${js_url}"]`;
        js_elem = document.createElement("script");
        js_elem.type = "application/javascript";
        js_elem.src = js_url;
        document.body.appendChild(js_elem);

        js_elem.onload = function() {
          console.log(element);
          standard.loadComponent(element, page, selector);
          comp_loaded_function_called = true;
          return true;
        };
      },

      loadScriptFiles: function(
        target_element,
        page,
        selector,
        html_url,
        js_url,
        css_url
      ) {
        var js_script_selector,
          css_script_selector,
          comp_loaded_function_called;
        comp_loaded_function_called = false;

        this.loadHtmlFile(html_url, target_element, page, selector);

        js_script_selector = `script[src="${js_url}"]`;
        css_script_selector = `script[src="${css_url}"]`;

        comp_loaded_function_called = this.loadJsFile(
          js_url,
          target_element,
          page,
          selector
        );

        if (!document.querySelector(css_script_selector) && css_url) {
          this.loadCssFile(css_url, target_element, page, selector);
        }

        if (!comp_loaded_function_called) {
          this.replaceData(target_element, page);
        }
      },

      render: function(page, target, selector) {
        var html_url =
          this.utility.html_file_location + page + "/" + page + ".html";
        console.log(html_url);
        var js_url = this.utility.js_file_location + page + "/" + page + ".js";
        console.log(js_url);
        this.loadScriptFiles(target, page, selector, html_url, js_url);
      },

      passData: function(to_child_component, data) {
        var comp_data = this.components[to_child_component].component_data.data;
        for (let i in data) {
          // if (data.hasOwnProperty(i))
          comp_data[i] = data[i];
        }
      },

      setData: function(of_current_component, data) {
        console.log("setData");
        var comp_data = this.components[of_current_component].component_data;
        for (let i in data) {
          comp_data.data[i] = data[i];
        }
        var element = document.querySelector(comp_data.current_target);
        this.replaceData(element, of_current_component, data);
      },

      storeComponent: function(new_component, component_data) {
        alert("here");
        if (!this.components[new_component]) {
          this.components[new_component] = {
            component_name: new_component,
            component_data: component_data
          };
          if (component_data.events) {
            this.componentEvents(new_component, component_data);
          }
        }
      },

      renderOnTarget: function(component, target) {
        if (typeof arguments[1] === "object") {
        }
        this.components[component].component_data.current_target = target;
        var element = document.querySelector(target);
        element.innerHTML = this.templates[component];
        this.loadComponent(element, component);
      },

      componentEvents: function(component, component_store_data) {
        component_store_data.events.forEach(event => {
          if (event.onClick) {
            var target_elements = document.querySelectorAll(event.target);
            target_elements.forEach(target_element => {
              target_element.addEventListener("click", event.onClick);
            });
          }

          if (event.onMouseOver) {
            var target_elements = document.querySelectorAll(event.target);
            target_elements.forEach(target_element => {
              target_element.addEventListener("mouseover", event.onMouseOver);
            });
          }

          if (event.onInput) {
            var target_elements = document.querySelectorAll(event.target);
            console.log(target_elements);
            target_elements.forEach(target_element => {
              target_element.addEventListener("input", event.onInput);
            });
          }

          if (event.onChange) {
            var target_elements = document.querySelectorAll(event.target);
            console.log(target_elements);
            target_elements.forEach(target_element => {
              target_element.addEventListener("change", event.onChange);
            });
          }
        });
      },

      renderTheDataIfIdPresent: function(element, data_ids, data, component) {
        console.log(this, element);
        for (var data_id in data_ids) {
          console.log("here I am", data_id, data);
          if (data_id in data) {
            var ele_to_be_changed = element.querySelectorAll(
              "[std-id-" + data_id + "]"
            );
            ele_to_be_changed.forEach(ele => {
              ele.innerText = this.components[component].component_data.data[
                data_id
              ];
            });
          }
        }
      },

      replaceData: function(element, component, data) {
        console.log("inside replace", element, component);
        console.log(standard.components);
        var component_store_data,
          result,
          regex_for_handlebar,
          innerHTML_str,
          array_storing_matches;
        if (this.components[component].observables) {
          var data_ids = this.components[component].observables;

          if (data) {
            this.renderTheDataIfIdPresent(element, data_ids, data, component);
          }
        }

        if (element) {
          console.log("inside replaceData", typeof element, component);
          component_store_data = this.components[component].component_data;
          regex_for_handlebar = /\{{(.*?)\}}/g;
          innerHTML_str = element.innerHTML;
          array_storing_matches = [];
          

          while (
            (array_storing_matches = regex_for_handlebar.exec(innerHTML_str)) !=
            null
          ) {
            console.log("here");
            var match_found = array_storing_matches[1];

            if (!this.components[component].observables) {
              this.components[component].observables = {};
            }

            this.components[component].observables[match_found] =
              "std-id-" + match_found;

            var component_data_array = this.components[component]
              .component_data;
            component_store_data = component_data_array;

            if (
              component_data_array.data[match_found]
            ) {
              innerHTML_str = innerHTML_str.replace(
                array_storing_matches[0],
                "<span std-id-" +
                  array_storing_matches[1] +
                  ">" +
                  component_data_array.data[match_found] +
                  "</span>"
              );

              element.innerHTML = innerHTML_str;
            } else if (
              Array.isArray(component_data_array.data[match_found]) === true
            ) {
            }
          }
        }
      },

      loadComponent: function(target_element, component, selector) {
        if (target_element) {
          this.replaceData(target_element, component);
          var component_store_data = this.components[component].component_data;
          this.components[component].component_data.current_target = selector;

          if (component_store_data.events) {
            this.componentEvents(component, component_store_data);
          }
        }
      }
    };

    document.addEventListener("click", function(e) {
      if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector;
      }
      if (e.target && e.target.matches("a[data-standard-component]")) {
        var page = e.target.dataset.standardComponent;
        var target = document.querySelector("[standard-view]");

        standard.render(page, target, "[standard-view]");
      }
    });

    return stdlib;

  }
  document.onreadystatechange = function(e) {
    if (document.readyState === "complete") {
      console.log(e);
      window.standard = initApplication();
    }
  };
})();
