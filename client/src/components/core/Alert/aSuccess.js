import swal from 'sweetalert2'

const aSuccess = (title, message) => swal({
	position: 'top-end',
	type: 'success',
	title,
	text: message,
	showConfirmButton: false,
	timer: 2000,
	backdrop: false,
 })

export default aSuccess
