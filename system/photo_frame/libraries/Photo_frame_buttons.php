<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_buttons {
	
	public function modify_tables($table)
	{
		$buttons = $this->get();
		
		foreach($buttons as $button)
		{
			$table = array_merge($table, $button->modifyTables($table));
		}
		
		return $table;
	}
	
	public function update($current = '')
	{
		foreach($this->get() as $button)
		{
			$button->update($current);
		}
	}
	
	public function install()
	{
		foreach($this->get() as $button)
		{
			$button->install();
		}
	}
	
	public function uninstall()
	{
		foreach($this->get() as $button)
		{
			$button->uninstall();
		}
	}
	
	public function get($params = array())
	{
		$return = array();
			
		if(!class_exists('PhotoFrameButton'))
		{
			require_once PATH_THIRD . 'photo_frame/libraries/PhotoFrameButton.php';
		}
			
		foreach(directory_map(PATH_THIRD) as $addon_name => $addon)
		{
			if(isset($addon['photo_frame']) && is_array($addon['photo_frame']))
			{
				foreach($addon['photo_frame'] as $file)
				{					
					$return[str_replace('.php', '', $file)] = $this->_load('photo_frame', $addon_name, $file, $params);
				}
			}
			
			if(isset($addon['buttons']) && is_array($addon['buttons']))
			{
				foreach($addon['buttons'] as $file)
				{					
					$return[str_replace('.php', '', $file)] = $this->_load('buttons', $addon_name, $file, $params);
				}
			}
		}
		
		return $return;
	}
	
	private function _load($directory, $addon_name, $file, $params = array())
	{		
		$name  = str_replace('.php', '', $file);
		$class = ucfirst($name).'Button';
		
		if(!class_exists($name))
		{
			require_once(PATH_THIRD . $addon_name . '/'.$directory.'/' . $file);
		}
		
		return new $class($params);
	}	
}