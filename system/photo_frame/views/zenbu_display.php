<?php if(count($photos) > 0): ?>
	<ul class="photo-frame-zenbu-display">
	<?php foreach($photos as $photo): ?>
		<li class="photo-frame-zenbu-photo">
			<a href="<?php echo $photo->url?>"><img src="<?php echo $photo->url?>" alt="<?php echo $photo->title?>" /></a>
		</li>
	<?php endforeach; ?>
	</ul>
<?php else: ?>
	<p class="photo-frame-zenbu-empty">No photo to display.</p>
<?php endif; ?>