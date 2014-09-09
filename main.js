/* global define, $, jQuery, brackets*/
/* jshint esnext:true */

define(function (require, exports, module) {
    "use strict";

    //Modules to load
    var AppInit = brackets.getModule("utils/AppInit"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
		ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        NodeConnection = brackets.getModule("utils/NodeConnection");

    var NAVIGATE_FORWARD = "opensourceportfolio.navigation.forwards",
        NAVIGATE_BACK = "opensourceportfolio.navigation.backwards";

    var positionStack = require("positionStack"),
        lastPosition,
        isCursorActivity = true,
        currentEditor;

   	ExtensionUtils.loadStyleSheet(module, "styles.css");
   
    function navigate(direction) {
        return function () {
            var value,
                document;

            do {
                value = positionStack[direction]();
                if (value){
                    document = DocumentManager.getOpenDocumentForPath(value.fullPath);
                }
            } while (value && !document);

            if (value && document) {
                isCursorActivity = false;
                DocumentManager.setCurrentDocument(document);
               
                  var currentEditor = EditorManager.getCurrentFullEditor();
		          currentEditor.setCursorPos(value.position.line, value.position.ch, true);
		          currentEditor.focus();
               
                //EditorManager.getCurrentFullEditor()._codeMirror.setCursor(value.position);
                isCursorActivity = true;
            }
        };
    }

    function cursorActivity() {
        var position = currentEditor._codeMirror.getCursor(true);

        if (isCursorActivity) {
            if (!lastPosition || Math.abs(lastPosition.line - position.line) > 1) {
                positionStack.push({
                    'position': position,
                    'fullPath': currentEditor.document.file.fullPath
                });
            }
            lastPosition = position;
        }
    }

    function setEditorListener(editor) {
        if (currentEditor) {
            currentEditor._codeMirror.off('cursorActivity');
        }
        
		currentEditor = EditorManager.getCurrentFullEditor();
		
		if (currentEditor){
			currentEditor._codeMirror.on('cursorActivity', cursorActivity);
		}
    }

       $(document.createElement("a"))
        .attr("id", "navigation-back-icon")
        .attr("href", "#")
        .attr("title", "Navigate back")
        .on("click", navigate("back"))
        .appendTo($("#main-toolbar .buttons"));

       $(document.createElement("a"))
        .attr("id", "navigation-forward-icon")
        .attr("href", "#")
        .attr("title", "Navigate forward")
        .on("click", navigate("forward"))
        .appendTo($("#main-toolbar .buttons"));

   AppInit.appReady(function () {
        CommandManager.register("Navigate forward", NAVIGATE_FORWARD, navigate("forward"));
        CommandManager.register("Navigate back", NAVIGATE_BACK, navigate("back"));

        KeyBindingManager.addBinding(NAVIGATE_FORWARD, "Ctrl-Alt-Right", brackets.platform);
        KeyBindingManager.addBinding(NAVIGATE_BACK, "Ctrl-Alt-Left", brackets.platform);

        setEditorListener(EditorManager.getCurrentFullEditor());

        $(EditorManager).on('activeEditorChange', function () {
            setEditorListener();
        });
       
    });
});
