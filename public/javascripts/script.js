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
            success: function(comment){
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
