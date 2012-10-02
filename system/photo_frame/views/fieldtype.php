<div class="photo-frame-wrapper" id="<?php echo $field_name?>_wrapper">

	<div class="photo-frame-preview clearfix">
	<?php foreach($data as $index => $photo): ?>
		<div class="photo-frame-photo" id="photo-frame-photo-<?php echo $id?>-<?php echo $index?>">
			<img src="<?php echo $photo->file_url?>?date=<?php echo time()?>" id="ohot" />
			
			<div class="photo-frame-action-bar">
				<a href="#<?php echo $index?>" class="photo-frame-edit"><span class="icon-edit"></span></a>
				<a href="#<?php echo !isset($photo->id) ? $id : $photo->id?>" class="photo-frame-delete"><span class="icon-trash"></span></a>
			</div>
		</div>
	
		<textarea name="<?php echo $field_name?>[<?php echo isset($photo->new) ? 'new' : 'edit'?>][<?php echo $index?>]" id="photo-frame-<?php echo isset($photo->new) ? 'new' : 'edit'?>-photo-<?php echo !isset($photo->id) ? $id : $photo->id?>-<?php echo $index?>" style="display:none"><?php echo json_encode($photo->saved_data);?></textarea>
		
	<?php endforeach; ?>
	</div>
	
	<a href="#" class="photo-frame-button photo-frame-upload photo-frame-margin-top"><span class="icon-upload-alt"></span> <?php echo $button_text?></a>
</div>