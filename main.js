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
        NodeConnection = brackets.getModule("utils/NodeConnection");

    var NAVIGATE_FORWARD = "opensourceportfolio.navigation.forwards",
        NAVIGATE_BACK = "opensourceportfolio.navigation.backwards";

    var positionStack = require("positionStack"),
        lastPosition,
        isCursorActivity = true,
        currentEditor;

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
                EditorManager.getCurrentFullEditor()._codeMirror.setCursor(value.position);
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
