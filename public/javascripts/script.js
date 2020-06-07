/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


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


$(document).ready(function editcomment()
{
    $(document).on('click', '#editComment', function()
    {
        const commentid = $(this).attr('data-id');
        const textcomment = $(this).attr('data-text');
        
        $('#IdEditcomment').val(commentid);
        $('#textEditcomment').text(textcomment);
        $('#updatecomment').modal('show');
    })
})


$(document).ready(function insertcomment()
{
    $(document).on('click', '#btnPostcomment', function()
    {
        const textcomment = $('#textInputComment').val();
        const postid = $('#textInputComment').attr('data-postIdOfCommment');
        console.log(textcomment);
        console.log(postid);
        $.ajax({
            url: "/travel/comment/" + postid,
            method: "POST",
            data : {text:textcomment},
            success: function(comment)
            {
                location.reload()
            },
            error: function(err){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'เกิดข้อผิดพลาด ไม่สามารถดำเนินการได้!',
                    timer: 1200
                })
            }
        })
    })
})



$(document).ready(function updatecomment()
{
    $(document).on('click', '#btnupdatecomment', function()
    {
        const commentid = $('#IdEditcomment').val();
        const textcomment = $('#textEditcomment').val();

        $.ajax({
            url: "/travel/comment/" + commentid + "/edit/?_method=PUT",
            method: "POST",
            data : {text:textcomment},
            success: (
                Swal.fire({
                    icon: 'success',
                    title: 'แก้ไขสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                  }),
                location.reload()
            ),
            error: function(){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'เกิดข้อผิดพลาด ไม่สามารถดำเนินการได้!',
                    timer: 2000
                })
            }
        })
    })
})


$(document).ready(function deletecomment()
{
    $(document).on('click', '#deleteComment', function()
    {
        const commentid = $(this).attr('data-id');
        Swal.fire({
                    title: 'คุณต้องการลบคอมเม้นนี้หรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'ใช่',
                    cancelButtonText: 'ยกเลิก'
                  }).then((result) => {
                    if (result.value) 
                    {
                        $.ajax({
                            url: "/travel/comment/" + commentid + "/?_method=DELETE",
                            method: "POST",
                            success: (
                                Swal.fire(
                                    'Deleted!',
                                    'ลบสำเร็จแล้ว!',
                                    'success'
                                ),
                                location.reload()
                            ), 
                            error: function(){
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'เกิดข้อผิดพลาด ไม่สามารถดำเนินการได้!',
                                    timer: 2000
                                  })
                            }
                        })
                        
                    }
                  })
        
    })
})



$(document).ready(function insertFavouritePost()
{
    $(document).on('click', '#favourite', function()
    {
        const postid = $('#favourite').attr('data-favouritepost');
        console.log(postid);
        $.ajax({
            url: "/travel/favorite/" + postid,
            method: "POST",
            success: function(post)
            {
              Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'เพิ่มในรายการโปรดแล้ว',
                showConfirmButton: false,
                timer: 1500
              })
              // console.log($('#favourite_seved').html());
              // $('#favourite').change($('#favourite_seved'));
              
            },
            error: function(err){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'เกิดข้อผิดพลาด ไม่สามารถบันทึกได้!',
                    showConfirmButton: true,
                })
            }
        })
    })
})




// Auto Complete #Tag in page addpost
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/

      for (i = 0; i < arr.length; i++) 
      {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("SPAN");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong class='fa fa-tags'>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("span");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}


const tags = $("#tags").attr('data-tags');
if(tags)
{
  const arrayOfTag = tags.split(',');
  console.log(tags)
  console.log(arrayOfTag)
  autocomplete(document.getElementById("tags"), arrayOfTag);
}





