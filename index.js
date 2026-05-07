/**
 * Local Username — Revenge (classic) plugin
 * Visually change how your username appears in chat.
 * Only visible to YOU — purely cosmetic, no server-side changes.
 *
 * The loader wraps this file as:
 *   (bunny, definePlugin) => { <this code>; return plugin?.default ?? plugin; }
 *
 * So we must assign the plugin instance to `plugin`.
 */

const { after } = bunny.api.patcher;
const { findByProps, findByDisplayName } = bunny.metro;
const storage = bunny.plugin.createStorage();
const log = bunny.plugin.logger;

// ── Default settings ──────────────────────────────────────────────
const DEFAULTS = {
    customUsername: "",
};

function getSettings() {
    return { ...DEFAULTS, ...storage };
}

// ── Find current user ID ──────────────────────────────────────────
function getCurrentUserId() {
    try {
        const UserStore = findByProps("getCurrentUser", "getUser");
        return UserStore?.getCurrentUser?.()?.id;
    } catch (e) {
        log.error("Failed to get current user ID:", e);
        return null;
    }
}

function shouldOverride(userId) {
    const myId = getCurrentUserId();
    return myId && userId === myId;
}

// ── Text replacement helper ────────────────────────────────────────
function replaceTextInChildren(el, newText) {
    if (!el || !el.props) return;
    if (typeof el.props.children === "string") {
        el.props.children = newText;
        return;
    }
    if (Array.isArray(el.props.children)) {
        for (let i = 0; i < el.props.children.length; i++) {
            const child = el.props.children[i];
            if (typeof child === "string") {
                el.props.children[i] = newText;
            } else if (child && child.props) {
                replaceTextInChildren(child, newText);
            }
        }
    }
    if (el.props.children && el.props.children.props) {
        replaceTextInChildren(el.props.children, newText);
    }
}

// ── Patch targets ──────────────────────────────────────────────────
const unpatches = [];

// Strategy 1: Patch UserUtils (getGlobalName / getUsername)
const UserUtils = findByProps("getGlobalName", "getUsername");

if (UserUtils) {
    if (UserUtils.getGlobalName) {
        const unpatch = after("getGlobalName", UserUtils, function (args, ret) {
            const userId = (args[0] && args[0].id) || args[0];
            if (shouldOverride(userId)) {
                const s = getSettings();
                if (s.customUsername) return s.customUsername;
            }
            return ret;
        });
        if (typeof unpatch === "function") unpatches.push(unpatch);
    }

    if (UserUtils.getUsername) {
        const unpatch = after("getUsername", UserUtils, function (args, ret) {
            const userId = (args[0] && args[0].id) || args[0];
            if (shouldOverride(userId)) {
                const s = getSettings();
                if (s.customUsername) return s.customUsername;
            }
            return ret;
        });
        if (typeof unpatch === "function") unpatches.push(unpatch);
    }
}

// Strategy 2: Patch MessageAuthor / Username display components
const MessageAuthor = findByDisplayName("MessageAuthor", false)
    || findByDisplayName("Username", false);

if (MessageAuthor && MessageAuthor.default) {
    const unpatch = after("default", MessageAuthor, function (args, ret) {
        try {
            var props = args[0] || {};
            var userId = (props.user && props.user.id) || (props.author && props.author.id) || props.id;
            if (shouldOverride(userId)) {
                var s = getSettings();
                if (s.customUsername && ret && ret.props) {
                    replaceTextInChildren(ret, s.customUsername);
                }
            }
        } catch (e) { /* silently ignore render errors */ }
        return ret;
    });
    if (typeof unpatch === "function") unpatches.push(unpatch);
}

// Strategy 3: Patch UsernameText
const UsernameText = findByDisplayName("UsernameText", false)
    || findByDisplayName("DisplayName", false);

if (UsernameText && UsernameText.default) {
    const unpatch = after("default", UsernameText, function (args, ret) {
        try {
            var props = args[0] || {};
            var userId = (props.user && props.user.id) || (props.author && props.author.id);
            if (shouldOverride(userId)) {
                var s = getSettings();
                if (s.customUsername && ret && ret.props) {
                    replaceTextInChildren(ret, s.customUsername);
                }
            }
        } catch (e) { /* silently ignore */ }
        return ret;
    });
    if (typeof unpatch === "function") unpatches.push(unpatch);
}

// ── Plugin instance ────────────────────────────────────────────────
var plugin = {
    start: function () {
        log.info("Local Username started");
        var s = getSettings();
        if (s.customUsername) {
            log.info("Overriding username to: " + s.customUsername);
        }
    },

    stop: function () {
        for (var i = 0; i < unpatches.length; i++) {
            try { unpatches[i](); } catch (e) { /* ignore */ }
        }
        unpatches.length = 0;
        log.info("Local Username stopped");
    },

    SettingsComponent: function () {
        var React = bunny.metro.common.React;
        var RN = bunny.metro.common.ReactNative;
        var TextInput = RN.TextInput;
        var View = RN.View;
        var Text = RN.Text;
        var TouchableOpacity = RN.TouchableOpacity;
        var ScrollView = RN.ScrollView;

        var _s = getSettings();
        var _input = React.useState(_s.customUsername || "");
        var inputValue = _input[0];
        var setInputValue = _input[1];

        var updateSetting = function (key, value) {
            storage[key] = value;
        };

        var containerStyle = {
            padding: 16,
            backgroundColor: "#2f3136",
            borderRadius: 8,
            margin: 16
        };
        var labelStyle = {
            color: "#ffffff",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8
        };
        var descStyle = {
            color: "#b9bbbe",
            fontSize: 13,
            marginBottom: 12
        };
        var inputStyle = {
            backgroundColor: "#202225",
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#040405",
            color: "#dcddde",
            padding: 10,
            fontSize: 16,
            marginBottom: 16
        };
        var buttonStyle = {
            backgroundColor: "#5865f2",
            borderRadius: 4,
            padding: 12,
            alignItems: "center"
        };
        var buttonTextStyle = {
            color: "#ffffff",
            fontWeight: "600",
            fontSize: 16
        };

        return React.createElement(ScrollView, { style: { flex: 1, backgroundColor: "#36393f" } },
            React.createElement(View, { style: containerStyle },
                React.createElement(Text, { style: labelStyle }, "Custom Username"),
                React.createElement(Text, { style: descStyle },
                    "Set a custom display name. Only visible to you in chat."
                ),
                React.createElement(TextInput, {
                    style: inputStyle,
                    placeholder: "Enter custom username...",
                    placeholderTextColor: "#72767d",
                    value: inputValue,
                    onChangeText: setInputValue
                }),
                React.createElement(TouchableOpacity, {
                    style: buttonStyle,
                    onPress: function () {
                        updateSetting("customUsername", inputValue);
                    }
                },
                    React.createElement(Text, { style: buttonTextStyle }, "Save Username")
                ),
                inputValue ? React.createElement(TouchableOpacity, {
                    style: { backgroundColor: "#ed4245", borderRadius: 4, padding: 12, alignItems: "center", marginTop: 8 },
                    onPress: function () {
                        setInputValue("");
                        updateSetting("customUsername", "");
                    }
                },
                    React.createElement(Text, { style: buttonTextStyle }, "Clear Username")
                ) : null,
                React.createElement(View, { style: { marginTop: 16, padding: 12, backgroundColor: "#202225", borderRadius: 4 } },
                    React.createElement(Text, { style: { color: "#b9bbbe", fontSize: 13 } },
                        storage.customUsername
                            ? "Active: Your username appears as \"" + storage.customUsername + "\""
                            : "No custom username set. Default username is shown."
                    )
                )
            )
        );
    }
};
