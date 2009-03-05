/**
 * This software is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * @copyright  Copyright (c) 2008 Mayflower GmbH (http://www.mayflower.de)
 * @license    LGPL 2.1 (See LICENSE file)
 * @version    $Id$
 * @author     Gustavo Solt <solt@mayflower.de>
 * @package    PHProjekt
 * @link       http://www.phprojekt.com
 * @since      File available since Release 6.0
 */

dojo.provide("phpr.Default.Main");

dojo.declare("phpr.Default.Main", phpr.Component, {
    // summary: class for initialilzing a default module
    tree:             null,
    grid:             null,
    module:           null,
    gridWidget:       null,
    formWidget:       null,
    treeWidget:       null,
    globalModules:    null,
    _langUrl:         null,

    loadFunctions:function(module) {
        // summary:
        //    Add the all the functions for the current module
        // description:
        //    Add the all the functions for the current module
        //    So is possible use Module.Function
        dojo.subscribe(module + ".load", this, "load");
        dojo.subscribe(module + ".changeProject",this, "loadSubElements");
        dojo.subscribe(module + ".reload", this, "reload");
        dojo.subscribe(module + ".openForm", this, "openForm");
        dojo.subscribe(module + ".showSuggest", this, "showSuggest");
        dojo.subscribe(module + ".hideSuggest", this, "hideSuggest");
        dojo.subscribe(module + ".setSuggest", this, "setSuggest");
        dojo.subscribe(module + ".showSearchResults", this, "showSearchResults");
        dojo.subscribe(module + ".drawTagsBox", this, "drawTagsBox");
        dojo.subscribe(module + ".showTagsResults", this, "showTagsResults");
        dojo.subscribe(module + ".clickResult", this, "clickResult");
        dojo.subscribe(module + ".updateCacheData", this, "updateCacheData");
        dojo.subscribe(module + ".loadResult", this, "loadResult");
        dojo.subscribe(module + ".setLanguage", this, "setLanguage");
        dojo.subscribe(module + ".showHelp", this, "showHelp");
        dojo.subscribe(module + ".openHtmlEditor", this, "openHtmlEditor");
        dojo.subscribe(module + "._isGlobalModule", this, "_isGlobalModule");
    },

    openForm:function(/*int*/id, /*String*/module) {
        //summary: this function opens a new Detail View
        if (!dojo.byId('detailsBox')) {
            this.reload();
        }
        this.form = new this.formWidget(this,id,module);
    },

    loadResult:function(/*int*/id, /*String*/module, /*int*/projectId) {
        this.cleanPage();
        phpr.currentProjectId = projectId;
        this.loadSubElements(projectId);
        this.openForm(id, module);
    },

    loadSubElements:function(projectId) {
        // summary:
        //    this function loads a new project with the default submodule
        // description:
        //    If the current submodule don�t have access, the first found submodule is used
        //    When a new submodule is called, the new grid is displayed,
        //    the navigation changed and the Detail View is resetted
        phpr.currentProjectId = projectId;
        if (!phpr.currentProjectId) {
            phpr.currentProjectId = phpr.rootProjectId;
        }
        if (this._isGlobalModule(this.module)) {
            // System Global Modules
            if (this.module == 'Administration' ||
                this.module == 'Setting' ||
                this.module == 'User' ||
                this.module == 'Role' ||
                this.module == 'Tab' ||
                this.module == 'Module') {
                dojo.publish("Project.changeProject", [phpr.currentProjectId]);
            } else {
                if (this.module == 'Timecard') {
                    dojo.publish("Project.changeProject", [phpr.currentProjectId]);
                } else {
                    dojo.publish(this.module + ".reload");
                }
            }
        } else {
            var subModuleUrl   = phpr.webpath + 'index.php/Default/index/jsonGetModulesPermission/nodeId/' + phpr.currentProjectId;
            phpr.DataStore.addStore({url: subModuleUrl});
            phpr.DataStore.requestData({
                url: subModuleUrl,
                processData: dojo.hitch(this,function() {
                    var usefirstModule = true;
                    var firstModule    = null;
                    var currentModule  = null;
                    var modules = phpr.DataStore.getData({url: subModuleUrl}) || array();
                    for (var i = 0; i < modules.length; i++) {
                        var moduleName     = modules[i].name;
                        var moduleFunction = modules[i].moduleFunction || null;
                        if (modules[i].rights.read) {
                            if (moduleName == this.module && moduleFunction != "basicData") {
                                usefirstModule = false;
                                currentModule  = moduleName;
                            }
                            if (!firstModule && (moduleName != this.module)) {
                                firstModule = moduleName;
                            }
                        }
                    }

                    if (currentModule) {
                        dojo.publish(currentModule + ".reload");
                    } else if (firstModule && usefirstModule) {
                        dojo.publish(firstModule + ".reload");
                    } else {
                        dojo.publish("Project" + ".basicData");
                    }
                }
            )})
        }
    },

    load:function() {
        // summary:
        //    This function initially renders the page
        // description:
        //    This function should only be called once as there is no need to render the whole page
        //    later on. Use reload instead to only replace those parts of the page which should change

        // important set the global phpr.module to the module which is currently loaded!!!
        phpr.module = this.module;

        this.render(["phpr.Default.template", "main.html"], dojo.body(), {
            webpath:       phpr.webpath,
            currentModule: phpr.module
        });

        this.render(["phpr.Default.template", "mainContent.html"],dojo.byId('centerMainContent'));
        this.hideSuggest();

        // Get all the tabs
        var tabStore = new phpr.Store.Tab();
        tabStore.fetch();

        // Get all the active users
        var userStore = new phpr.Store.User();
        userStore.fetch();

        this._langUrl = phpr.webpath + "index.php/Default/index/getTranslatedStrings/language/" + phpr.language;
        phpr.DataStore.addStore({url: this._langUrl});
        phpr.DataStore.requestData({url: this._langUrl, processData: dojo.hitch(this, function() {
                // Load the components, tree, list and details.
                phpr.nls = new phpr.translator(phpr.DataStore.getData({url: this._langUrl}));
                this.cleanPage();
                this.setGlobalModulesNavigation();
                this.setSubmoduleNavigation();
                this.setSearchForm();
                var updateUrl = phpr.webpath + 'index.php/'+phpr.module+'/index/jsonSaveMultiple/nodeId/' + phpr.currentProjectId;
                this.tree     = new this.treeWidget(this);
                this.grid     = new this.gridWidget(updateUrl, this, phpr.currentProjectId);
          })
        });
    },

    reload:function() {
        // summary:
        //    This function reloads the current module
        // description:
        //    This function initializes a module that might have been called before.
        //    It only reloads those parts of the page which might change during a PHProjekt session

        // important set the global phpr.module to the module which is currently loaded!!!
        phpr.module       = this.module;
        phpr.submodule    = '';
        phpr.parentmodule = '';
        this.render(["phpr.Default.template", "mainContent.html"],dojo.byId('centerMainContent'));
        this.cleanPage();
        if (this._isGlobalModule(this.module)) {
            this.setSubGlobalModulesNavigation();
        } else {
            this.setSubmoduleNavigation();
        }
        this.hideSuggest();
        this.setSearchForm();
        this.tree     = new this.treeWidget(this);
        var updateUrl = phpr.webpath + 'index.php/'+phpr.module+'/index/jsonSaveMultiple/nodeId/' + phpr.currentProjectId;
        this.grid     = new this.gridWidget(updateUrl, this, phpr.currentProjectId);
    },

    setGlobalModulesNavigation:function() {
        var toolbar   = dijit.byId('mainNavigation');
        var globalUrl = phpr.webpath+"index.php/Core/module/jsonGetGlobalModules";
        phpr.DataStore.addStore({url: globalUrl});
        phpr.DataStore.requestData({url: globalUrl, processData: dojo.hitch(this, function() {
                var globalModules = phpr.DataStore.getData({url: globalUrl});
                var isAdmin       = phpr.DataStore.getMetaData({url: globalUrl});
                for (i in globalModules) {
                    var button = new dijit.form.Button({
                        id:        "globalModule"+globalModules[i].id,
                        label:     phpr.nls.get(globalModules[i].label),
                        name:      globalModules[i].name,
                        showLabel: true,
                        onClick:   dojo.hitch(this, function(e) {
                            phpr.currentProjectId = phpr.rootProjectId;
                            dojo.publish(e.target.name + ".reload");
                        })
                    });
                    toolbar.addChild(button);
                    var separator = new dijit.ToolbarSeparator();
                    toolbar.addChild(separator);
                }

                // Setting
                var button = new dijit.form.Button({
                    id:        "globalModuleSettings",
                    label:     phpr.nls.get('Settings'),
                    showLabel: true,
                    onClick:   dojo.hitch(this, function() {
                        dojo.publish("Setting.reload");
                    })
                });
                toolbar.addChild(button);
                var separator = new dijit.ToolbarSeparator();
                toolbar.addChild(separator);

                if (isAdmin > 0) {
                    // Administration
                    var button = new dijit.form.Button({
                        id:        "globalModuleAdmin",
                        label:     phpr.nls.get('Administration'),
                        showLabel: true,
                        onClick:   dojo.hitch(this, function() {
                            dojo.publish("Administration.reload");
                        })
                    });
                    toolbar.addChild(button);
                    var separator = new dijit.ToolbarSeparator();
                    toolbar.addChild(separator);
                }

                // Help
                var button = new dijit.form.Button({
                    id:        "globalModuleHelp",
                    label:     phpr.nls.get('Help'),
                    showLabel: true,
                    onClick:   dojo.hitch(this, function() {
                        dojo.publish(this.module + ".showHelp");
                    })
                });
                toolbar.addChild(button);
                var separator = new dijit.ToolbarSeparator();
                toolbar.addChild(separator);

                // Logout
                var button = new dijit.form.Button({
                    id:        "globalModuleLogout",
                    label:     phpr.nls.get('Logout'),
                    showLabel: true,
                    onClick:   dojo.hitch(this, function() {
                        location = phpr.webpath+"index.php/Login/logout";
                    })
                });
                toolbar.addChild(button);
            })
        });
    },

    _isGlobalModule:function(module) {
        // summary:
        //    Return if the module is global or per project
        // description:
        //    Return if the module is global or per project
        var globalUrl     = phpr.webpath+"index.php/Core/module/jsonGetGlobalModules";
        var globalModules = phpr.DataStore.getData({url: globalUrl});

        // System Global Modules
        if (module == 'Administration' ||
            module == 'Setting' ||
            module == 'User' ||
            module == 'Role' ||
            module == 'Module') {
            return true;
        } else {
            for (index in globalModules) {
                if (globalModules[index]['name'] == module) {
                    return true;
                }
            }
        }
        return false;
    },

    setSubmoduleNavigation:function(currentModule) {
        // summary:
        //    This function is responsible for displaying the Navigation of the current Module
        // description:
        //    When calling this function, the available Submodules for the current Module
        //    are received from the server and the Navigation is rendered accordingly
        var subModuleUrl      = phpr.webpath + 'index.php/Default/index/jsonGetModulesPermission/nodeId/' + phpr.currentProjectId;
        var self              = this;
        var createPermissions = false;
        phpr.DataStore.addStore({url: subModuleUrl});
        phpr.DataStore.requestData({
            url: subModuleUrl,
            processData: dojo.hitch(this,function() {
                var modules        = phpr.DataStore.getData({url: subModuleUrl});
                var foundBasicData = false;
                for (var i = 0; i < modules.length; i++) {
                    var moduleName  = modules[i].name;
                    if (modules[i].label == 'Basic Data') {
                        foundBasicData = true;
                    }
                }

                if (!foundBasicData && phpr.currentProjectId != 1) {
                    modules.unshift({
                        name:           "Project",
                        label:          "Basic Data",
                        rights:         {read: true},
                        moduleFunction: "basicData"
                    });
                }

                if (currentModule == "BasicData") {
                    phpr.module = 'Project';
                }

                var navigation ='<ul id="nav_main">';
                var activeTab = false;
                for (var i = 0; i < modules.length; i++) {
                    var liclass ='';
                    var moduleName     = modules[i].name;
                    var moduleLabel    = modules[i].label;
                    var moduleFunction = modules[i].moduleFunction || "reload";
                    if (modules[i].rights.read) {
                       if (moduleFunction == "basicData" && currentModule == 'BasicData' && !activeTab) {
                            liclass = 'class = active';
                            activeTab = true;
                        } else if (moduleName == phpr.module && moduleFunction != "basicData" && !activeTab) {
                            liclass = 'class = active';
                            activeTab = true;
                        }
                        navigation += self.render(["phpr.Default.template", "navigation.html"], null, {
                            moduleName :    moduleName,
                            moduleLabel:    moduleLabel,
                            liclass:        liclass,
                            moduleFunction: moduleFunction
                        });
                    }
                    if (modules[i].rights.create && moduleName == phpr.module && currentModule != 'BasicData') {
                        this.setNewEntry();
                    }
                }
                navigation += "</ul>";
                dojo.byId("subModuleNavigation").innerHTML = navigation;
                phpr.initWidgets(dojo.byId("subModuleNavigation"));
                this.customSetSubmoduleNavigation();
            })
        })
    },

    setNewEntry:function() {
        // summary:
        //    Create the Add button
        var params = {
            baseClass: "positive",
            label:     '',
            iconClass: 'add',
            alt:       'Add'
        };
        var newEntry = new dijit.form.Button(params);
        dojo.byId("buttonRow").appendChild(newEntry.domNode);
        dojo.connect(newEntry, "onClick", dojo.hitch(this, "newEntry"));
    },

    setSubGlobalModulesNavigation:function(currentModule) {
        // summary:
        //    This function is responsible for displaying the Navigation of the current Global Module
        // description:
        //    Delete all the submodules and put the add button
        this.setNewEntry();
    },

    customSetSubmoduleNavigation:function() {
        // summary:
        //     This function is called after the submodules are created
        //     Is used for extend the navigation routine
    },

    cleanPage:function() {
        // summary:
        //     Clean the submodule div and destroy all the buttons
        phpr.destroySubWidgets('buttonRow');
        phpr.destroySubWidgets('formButtons');
        dojo.byId("subModuleNavigation").innerHTML = '';
    },

    newEntry:function() {
        // summary:
        //     This function is responsible for displaying the form for a new entry in the
        //     current Module
        this.publish("openForm", [null]);
    },

    setSearchForm:function() {
        // summary:
        //    Add the onkeyup to the search field
        dojo.connect(dojo.byId("searchfield"), "onkeyup", dojo.hitch(this, "waitForSubmitSearchForm"));
    },

    waitForSubmitSearchForm:function(event) {
        // summary:
        //    This function call the search itself After 1000ms of the last letter
        // description:
        //    The function will wait for 1000 ms on each keyup for try to
        //    call the search query when the user finish to write the text
        //    If the enter is presses, the suggest disapear.
        //    If some "user" key is presses, the function don�t run.
        key = event.keyCode
        if (key == dojo.keys.ENTER || key == dojo.keys.NUMPAD_ENTER) {
            // hide the suggestBox and delete the time
            // for not show the suggest
            if (window.mytimeout) {
                window.clearTimeout(window.mytimeout);
            }
            this.hideSuggest();
        } else if (phpr.isValidInputKey(key)) {
            if (window.mytimeout) {
                window.clearTimeout(window.mytimeout);
            }
            window.mytimeout = window.setTimeout(dojo.hitch(this,"showSearchSuggest"), 500);
        }
    },

    showSearchSuggest:function() {
        // summary:
        //    This function show a box with suggest or quick result of the search
        // description:
        //    The server return the found records and the function display it
        var words = dojo.byId("searchfield").value;

        if (words.length >= 3) {
            // hide the suggestBox
            var getDataUrl = phpr.webpath + 'index.php/Default/Search/jsonSearch/words/' + words + '/count/10';
            var self = this;
            phpr.send({
                url:       getDataUrl,
                handleAs: "json",
                onSuccess: dojo.hitch(this,function(data){
                    var search        = '';
                    var results       = {};
                    var index         = 0;
                    for (var i = 0; i < data.length; i++) {
                        modulesData = data[i];
                        if (!results[modulesData.moduleLabel]) {
                            results[modulesData.moduleLabel] = '';
                        }
                        results[modulesData.moduleLabel] += self.render(["phpr.Default.template.results", "results.html"], null, {
                            id :           modulesData.id,
                            moduleId :     modulesData.modulesId,
                            moduleName:    modulesData.moduleName,
                            projectId:     modulesData.projectId,
                            firstDisplay:  modulesData.firstDisplay,
                            secondDisplay: modulesData.secondDisplay,
                            resultType:    "search"
                        });
                    }
                    var moduleLabel = '';
                    var html        = '';
                    for (var i in results) {
                        moduleLabel = i;
                        html       = results[i];
                        search += self.render(["phpr.Default.template.results", "suggestBlock.html"], null, {
                            moduleLabel:   moduleLabel,
                            results:       html
                        });
                    }

                    if (search == '') {
                        search += "<div class=\"searchsuggesttitle\" dojoType=\"dijit.layout.ContentPane\">";
                        search += phpr.drawEmptyMessage('There are no Results');
                        search += "</div>";
                    } else {
                        search += "<div class=\"searchsuggesttitle\" dojoType=\"dijit.layout.ContentPane\">";
                        search += "<a class=\"searchsuggesttitle\" href='javascript:dojo.publish(\""+this.module+".clickResult\",[\"search\"]); dojo.publish(\""+this.module+".showSearchResults\",[\"" + words + "\"])'>" + phpr.nls.get('View all') + "</a>";
                        search += "</div>";
                    }

                    this.setSuggest(search);
                    this.showSuggest();
                })
            });
        } else {
            this.hideSuggest();
        }
    },

    showSearchResults:function(/*String*/words) {
        // summary:
        //    This function reload the grid place with a search template
        //    And show the detail view of the item selected
        // description:
        //    The server return the found records and the function display it
        if (undefined == words) {
            words = dojo.byId("searchfield").value;
        }
        if (words.length >= 3) {
            var getDataUrl   = phpr.webpath + 'index.php/Default/Search/jsonSearch/words/' + words;
            var resultsTitle = phpr.nls.get('Search results');
            this.showResults(getDataUrl, resultsTitle);
        }
    },

    clickResult:function(/*String*/type) {
        if (type == 'search') {
            this.hideSuggest();
        }
    },

    showSuggest:function() {
        if (dojo.byId("searchsuggest").innerHTML != '') {
            dojo.byId("searchsuggest").style.display = 'inline';
        }
    },

    hideSuggest:function() {
        dojo.byId("searchsuggest").style.display = 'none';
    },

    setSuggest:function(html) {
        dojo.byId("searchsuggest").innerHTML = html;
    },

    drawTagsBox:function(/*Array*/data) {
        var value   = '';
        var newline = false;
        var size    = '';
        for (var i = 0; i < data.length; i++) {
            if (((i % 3) == 0) && i != 0) {
                newline = true;
            } else {
                newline = false;
            }
            if (data[i]['count'] < 5) {
                size = 10;
            } else if (data[i]['count'] < 10) {
                size = 12;
            } else if (data[i]['count'] < 15) {
                size = 14;
            } else if (data[i]['count'] < 20) {
                size = 16;
            } else if (data[i]['count'] < 25) {
                size = 18;
            } else if (data[i]['count'] < 30) {
                size = 20;
            } else if (data[i]['count'] < 35) {
                size = 22;
            } else if (data[i]['count'] < 40) {
                size = 24;
            } else if (data[i]['count'] < 45) {
                size = 26;
            } else if (data[i]['count'] < 50) {
                size = 28;
            } else if (data[i]['count'] < 55) {
                size = 30;
            } else if (data[i]['count'] < 60) {
                size = 32;
            } else if (data[i]['count'] < 65) {
                size = 33;
            } else if (data[i]['count'] < 70) {
                size = 34;
            } else if (data[i]['count'] < 75) {
                size = 36;
            } else if (data[i]['count'] < 80) {
                size = 38;
            } else if (data[i]['count'] < 85) {
                size = 40;
            } else if (data[i]['count'] < 90) {
                size = 42;
            } else {
                size = 48;
            }
            value += this.render(["phpr.Default.template", "tag.html"], null, {
                moduleName: phpr.module,
                size: size,
                newline: newline,
                tag: data[i]['string']
            });
        }
        if (value == '') {
            value += phpr.drawEmptyMessage('There are no Tags');
        }
        dijit.byId("tagsbox").attr('content', value);
    },

    showTagsResults:function(/*String*/tag) {
        // summary:
        //    This function reload the grid place with the result of the tag search
        // description:
        //    The server return the found records and the function display it
        var getDataUrl   = phpr.webpath + 'index.php/Default/Tag/jsonGetModulesByTag/tag/' + tag;
        var resultsTitle = phpr.nls.get('Tag results');
        this.showResults(getDataUrl, resultsTitle);
    },

    showResults:function(/*String*/getDataUrl, /*String*/resultsTitle) {
        // summary:
        //    This function reload the grid place with the result of a search or a tagt
        // description:
        //    The server return the found records and the function display it
        var self = this;

        // Clean the navigation and forms buttons
        this.cleanPage();

        this.hideSuggest();

        phpr.send({
            url:       getDataUrl,
            handleAs: "json",
            onSuccess: dojo.hitch(this,function(data){
                this.render(["phpr.Default.template.results", "mainContentResults.html"],dojo.byId('centerMainContent') ,{
                    resultsTitle:   resultsTitle
                });
                var search        = '';
                var results       = {};
                var index         = 0;
                for (var i = 0; i < data.length; i++) {
                    modulesData = data[i];
                    if (!results[modulesData.moduleLabel]) {
                        results[modulesData.moduleLabel] = '';
                    }
                    results[modulesData.moduleLabel] += self.render(["phpr.Default.template.results", "results.html"], null, {
                        id :           modulesData.id,
                        moduleId :     modulesData.modulesId,
                        moduleName:    modulesData.moduleName,
                        projectId:     modulesData.projectId,
                        firstDisplay:  modulesData.firstDisplay,
                        secondDisplay: modulesData.secondDisplay,
                        resultType:    "tag"
                    });
                }
                var moduleLabel = '';
                var html       = '';
                for (var i in results) {
                    moduleLabel = i;
                    html       = results[i];
                    search += self.render(["phpr.Default.template.results", "resultsBlock.html"], null, {
                        moduleLabel:   moduleLabel,
                        results:       html
                    });
                }
                if (search == '') {
                    search += phpr.drawEmptyMessage('There are no Results');
                }
                dijit.byId("gridBox").attr('content', search);
            })
        });
    },

    updateCacheData:function() {
        // summary:
        //    This function reload the grid place with the result of a search or a tagt
        // description:
        //    The server return the found records and the function display it
        if (this.grid) {
            this.grid.updateData();
        }
        if (this.form) {
            this.form.updateData();
        }
    },

    setLanguage:function(language) {
        // summary:
        //    Request to the server the languagues strings and change the current lang
        // description:
        //    Request to the server the languagues strings and change the current lang
        //    Call the reload function then
        phpr.language = language;
        this._langUrl = phpr.webpath + "index.php/Default/index/getTranslatedStrings/language/" + phpr.language;
        phpr.DataStore.addStore({url: this._langUrl});
        phpr.DataStore.requestData({url: this._langUrl, processData: dojo.hitch(this, function() {
            phpr.nls = new phpr.translator(phpr.DataStore.getData({url: this._langUrl}));
            this.reload();
            })
        });
    },

    showHelp:function() {
        // summary:
        //    Display the Help for one module
        // description:
        //    The function will show the help under the string "Content Help"
        //    The translation must be an array and each index is a different tab
        phpr.destroyWidget('helpContent');

        // Get the current module or use the parent
        var currentModule = phpr.module;
        if (phpr.parentmodule && 'Administration' == phpr.parentmodule) {
            currentModule = phpr.parentmodule;
        }
        dijit.byId('helpDialog').attr('title', phpr.nls.get('Help', currentModule));
        dojo.byId('helpTitle').innerHTML = phpr.nls.get(currentModule, currentModule);

        var helpData = phpr.nls.get('Content Help', currentModule);
        if (typeof(helpData) == 'object') {
            var container = new dijit.layout.TabContainer({
                style: 'height:100%;',
                id:    'helpContent'
            }, document.createElement('div'));

            for (i in helpData) {
                var text = helpData[i];
                // Check if the tab have DEFAULT text
                if (text == 'DEFAULT') {
                    var defaultHelpData = phpr.nls.get('Content Help', 'Default');
                    if (typeof(defaultHelpData) == 'object' && defaultHelpData[i]) {
                        text = defaultHelpData[i];
                    }
                }
                container.addChild(new dijit.layout.ContentPane({
                    title:   i,
                    content: text
                }));
            }

            dijit.byId('helpContainer').attr("content", container);
            container.startup();
        } else {
            dijit.byId('helpContainer').attr("content", phpr.nls.get('No help available', currentModule));
        }
        dijit.byId('helpDialog').show();
    },

    openHtmlEditor:function(nodeId, value) {
        // summary:
        //    Open a dialog for edit the HTML content
        // description:
        //    Open a dialog for edit the HTML content
        this.form.openHtmlEditor(nodeId, value);
    }
});
