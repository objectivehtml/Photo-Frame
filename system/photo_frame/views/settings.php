<div class="<?php $matrix ? 'matrix' : NULL?>">

	<h2><?php echo lang('photo_frame_settings')?></h2>
	
	<p><i><?php echo lang('photo_frame_ignore_settings')?></i></p>
	
	<h3><?php echo lang('photo_frame_general_settings')?></h3>
	
	<?php echo $resize_table?>
	
	<h3><?php echo lang('photo_frame_photo_settings')?></h3>
	
	<?php echo $crop_table?>
	
	<h3><?php echo lang('photo_frame_interface_settings')?></h3>
	
	<?php echo $info_table?>

</div>
