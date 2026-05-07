(function(o,s,c,r){"use strict";

/*  Local Username — Revenge plugin
    Visually change how your username appears in chat.
    Only visible to YOU — purely cosmetic, no server-side changes. */

var DEFAULTS={customUsername:""};
var storage=Object.assign({},DEFAULTS);

function getSettings(){return Object.assign({},storage);}

// ── Find current user ID ───────────────────────────────────────
function getCurrentUserId(){
    try{
        var UserStore=s.findByName("getCurrentUser",!1)||s.findByName("UserStore",!1);
        if(UserStore&&UserStore.getCurrentUser){
            var u=UserStore.getCurrentUser();
            return u?u.id:null;
        }
    }catch(e){}
    return null;
}

function shouldOverride(userId){
    var myId=getCurrentUserId();
    return myId&&userId===myId;
}

// ── Text replacement helper ────────────────────────────────────
function replaceTextInChildren(el,newText){
    if(!el||!el.props)return;
    if(typeof el.props.children==="string"){
        el.props.children=newText;
        return;
    }
    if(Array.isArray(el.props.children)){
        for(var i=0;i<el.props.children.length;i++){
            var child=el.props.children[i];
            if(typeof child==="string"){
                el.props.children[i]=newText;
            }else if(child&&child.props){
                replaceTextInChildren(child,newText);
            }
        }
    }
    if(el.props.children&&el.props.children.props){
        replaceTextInChildren(el.props.children,newText);
    }
}

// ── Patch targets ──────────────────────────────────────────────
var unpatches=[];

// Strategy 1: Patch UserUtils (getGlobalName / getUsername)
var UserUtils=s.findByName("UserUtils",!1)||s.findByProps("getGlobalName","getUsername");

if(UserUtils){
    if(UserUtils.getGlobalName){
        var unpatch=r.after("getGlobalName",UserUtils,function(args,ret){
            var userId=(args[0]&&args[0].id)||args[0];
            if(shouldOverride(userId)){
                var s=getSettings();
                if(s.customUsername)return s.customUsername;
            }
            return ret;
        });
        if(typeof unpatch==="function")unpatches.push(unpatch);
    }

    if(UserUtils.getUsername){
        var unpatch2=r.after("getUsername",UserUtils,function(args,ret){
            var userId=(args[0]&&args[0].id)||args[0];
            if(shouldOverride(userId)){
                var s=getSettings();
                if(s.customUsername)return s.customUsername;
            }
            return ret;
        });
        if(typeof unpatch2==="function")unpatches.push(unpatch2);
    }
}

// Strategy 2: Patch MessageAuthor display components
var MessageAuthor=s.findByName("MessageAuthor",!1)||s.findByName("Username",!1);

if(MessageAuthor&&MessageAuthor.default){
    var unpatch3=r.after("default",MessageAuthor,function(args,ret){
        try{
            var props=args[0]||{};
            var userId=(props.user&&props.user.id)||(props.author&&props.author.id)||props.id;
            if(shouldOverride(userId)){
                var s=getSettings();
                if(s.customUsername&&ret&&ret.props){
                    replaceTextInChildren(ret,s.customUsername);
                }
            }
        }catch(e){}
        return ret;
    });
    if(typeof unpatch3==="function")unpatches.push(unpatch3);
}

// Strategy 3: Patch UsernameText
var UsernameText=s.findByName("UsernameText",!1)||s.findByName("DisplayName",!1);

if(UsernameText&&UsernameText.default){
    var unpatch4=r.after("default",UsernameText,function(args,ret){
        try{
            var props=args[0]||{};
            var userId=(props.user&&props.user.id)||(props.author&&props.author.id);
            if(shouldOverride(userId)){
                var s=getSettings();
                if(s.customUsername&&ret&&ret.props){
                    replaceTextInChildren(ret,s.customUsername);
                }
            }
        }catch(e){}
        return ret;
    });
    if(typeof unpatch4==="function")unpatches.push(unpatch4);
}

// ── Plugin instance ────────────────────────────────────────────
var plugin={
    start:function(){
        console.log("[Local Username] started");
    },
    stop:function(){
        for(var i=0;i<unpatches.length;i++){
            try{unpatches[i]();}catch(e){}
        }
        unpatches.length=0;
        console.log("[Local Username] stopped");
    },
    settings:{
        get:function(key){return storage[key]!==undefined?storage[key]:DEFAULTS[key];},
        set:function(key,value){storage[key]=value;}
    }
};

o.onUnload=function(){
    for(var i=0;i<unpatches.length;i++){
        try{unpatches[i]();}catch(e){}
    }
    unpatches.length=0;
};

return plugin;
})({},vendetta.metro,vendetta.metro.common,vendetta.patcher);
