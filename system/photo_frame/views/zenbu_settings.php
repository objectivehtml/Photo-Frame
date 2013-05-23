<div class="photo-frame-zenbu-setting">
	<label class="photo-frame-zenbu-setting-label"><?php echo $label?></label>
	<?php echo $description ? '<p class="photo-frame-zenbu-setting-desc">'.$description.'</p>' : '' ?>
	<div class="photo-frame-zenbu-setting-field">
		<?php echo $field?>
	</div>
	<?php echo !$last_row ? '<hr>' : ''?>
</div>