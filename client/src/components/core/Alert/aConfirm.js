import swal from 'sweetalert2'

const aConfirm = (title, message, { confirmButtonText } = {}) => swal({
	title,
	text: message,
	type: 'warning',
	showCancelButton: true,
	confirmButtonColor: '#3085d6',
	cancelButtonColor: '#d33',
	confirmButtonText: confirmButtonText || 'Yes',
})

export default aConfirm
