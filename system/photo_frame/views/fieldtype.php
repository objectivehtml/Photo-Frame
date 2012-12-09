<div class="photo-frame-wrapper <?php echo $theme?>" id="<?php echo $field_name?>_wrapper">
	
	<!--[if lt IE 10]> <div class="photo-frame-ie"> <![endif]-->
	    
		<div class="photo-frame-preview clearfix">
    		<ul class="<?php echo $sortable ? 'photo-frame-sortable' : NULL?> clearfix">
        		<?php foreach($data as $index => $photo): ?>
        		<li>
        			<div class="photo-frame-photo" id="photo-frame-photo-<?php echo $id?>-<?php echo $index?>">
        				<img src="<?php echo $photo->file_url?>?date=<?php echo time()?>" id="ohot" />
        				
        				<div class="photo-frame-action-bar">
        					<a href="#<?php echo $index?>" class="photo-frame-edit"><span class="icon-edit"></span></a>
        					<a href="#<?php echo !isset($photo->id) ? $id : $photo->id?>" class="photo-frame-delete"><span class="icon-trash"></span></a>
        				</div>
        			</div>
        			
        			<textarea name="<?php echo $field_name?>[][<?php echo isset($photo->new) ? 'new' : 'edit'?>]" id="photo-frame-<?php echo isset($photo->new) ? 'new' : 'edit'?>-photo-<?php echo !isset($photo->id) ? $id : $photo->id?>-<?php echo $index?>" style="display:none"><?php echo json_encode($photo->saved_data);?></textarea>
        		</li>
        		<?php endforeach; ?>
    		</ul>
		</div>
		
		<a href="#" class="photo-frame-button photo-frame-upload photo-frame-margin-top" <?php if($overlimit):?>style="display:none"<?php endif; ?>><span class="icon-upload"></span> <?php echo $button_text?></a>
		
		
		<?php if(!empty($upload_helper)): ?>
			<p class="photo-frame-helper" <?php if($overlimit):?>style="display:none"<?php endif; ?>><?php echo $upload_helper?></p>
		<?php endif; ?>
	
	<!--[if lt IE 10]> </div> <![endif]-->

</div>