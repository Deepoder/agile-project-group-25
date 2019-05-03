var toggleNavStatus = false;
var toggleNav = function () {
    var getSidebar = document.querySelector(".nav-sidebar");
    var getSidebarUl = document.querySelector(".nav-sidebar ul");
    if (toggleNavStatus === false) {
        getSidebarUl.style.visibility = 'visible';
        getSidebar.style.width = '272px';
        toggleNavStatus = true;

    } else if (toggleNavStatus === true) {
        getSidebar.style.width = '0';
        getSidebarUl.style.visibility = 'hidden';
        toggleNavStatus = false;
    }
};
