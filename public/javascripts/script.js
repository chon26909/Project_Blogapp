$(document).ready(function()
{
	$('.btn-toggle-user').click(function()
	{
		$('.navbar-top').toggleClass('active') 
    });


    $('.username').click(function()
	{
		$('.submenu-user').toggleClass('active') 
    });
});

$(document).ready(function()
{
    $('.btn-toggle-category').click(function()
    {
        $('.navbar-category').toggleClass('active') 
    });
});