/* global define, $, jQuery, brackets, window, console */
/* jshint esnext:true */

define(function (require, exports, module) {
    "use strict";

    //Modules to load
    var AppInit = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        KeyBindingManager = brackets.getModule("command/KeyBindingManager"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        NodeConnection = brackets.getModule("utils/NodeConnection");

    var NAVIGATE_FORWARD = "opensourceportfolio.navigation.forwards",
        NAVIGATE_BACK = "opensourceportfolio.navigation.backwards";

    var positionStack = require("positionStack"),
        lastPosition,
        isCursorActivity = true;

    function navigate(direction) {
        return function () {
            var editor = EditorManager.getActiveEditor(),
                name = editor.document.file.name,
                position = positionStack[direction](name);

            if (position) {
                isCursorActivity = false;
                editor._codeMirror.setCursor(position);
                isCursorActivity = true;
            }
        };
    }

    function cursorActivity() {
        var editor = EditorManager.getActiveEditor(),
            name = editor.document.file.name,
            position = editor._codeMirror.getCursor(true);

        if (isCursorActivity) {
            if (!lastPosition || Math.abs(lastPosition.line - position.line) > 1) {
                positionStack.push(position, name);
                console.log("new position");
            }
            lastPosition = position;
        }
    }

    function setEditorListener(editor, isEnable) {
        if (isEnable) {
            EditorManager.getActiveEditor()._codeMirror.on('cursorActivity', cursorActivity);
        } else {
            editor._codeMirror.off('cursorActivity');
        }
    }

    AppInit.appReady(function () {
        CommandManager.register("Navigate forward", NAVIGATE_FORWARD, navigate("forward"));
        CommandManager.register("Navigate back", NAVIGATE_BACK, navigate("back"));

        KeyBindingManager.addBinding(NAVIGATE_FORWARD, "Ctrl-Shift-Right", brackets.platform);
        KeyBindingManager.addBinding(NAVIGATE_BACK, "Ctrl-Shift-Left", brackets.platform);

        setEditorListener(EditorManager.getActiveEditor(), true);

        $(EditorManager).on('activeEditorChange', function (e, current, previous) {
            setEditorListener(previous, false);
            setEditorListener(current, true);
        });
    });
});