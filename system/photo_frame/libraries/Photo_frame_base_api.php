<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Photo_frame_base_api {
	
	protected $order_config;
	
	protected $class_name;
	
	protected $dir_name;
	
	public function __construct()
	{
		$this->EE =& get_instance();
	}
	
	public function modify_tables($table)
	{
		$objects = $this->get();
		
		foreach($objects as $button)
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
		
		if(!class_exists($this->class_name))
		{
			require_once PATH_THIRD . 'photo_frame/libraries/'.$this->class_name.'.php';
		}
			
		foreach(directory_map(PATH_THIRD) as $addon_name => $addon)
		{
			if(isset($addon['photo_frame'][$this->dir_name]) && is_array($addon['photo_frame']))
			{
				foreach($addon['photo_frame'][$this->dir_name] as $file)
				{		
					$return[str_replace('.php', '', $file)] = $this->_load('photo_frame/'.$this->dir_name, $addon_name, $file, $params);
				}
			}
			
			if(isset($addon[$this->dir_name]) && is_array($addon[$this->dir_name]))
			{
				foreach($addon[$this->dir_name] as $file)
				{					
					$return[str_replace('.php', '', $file)] = $this->_load($this->dir_name, $addon_name, $file, $params);
				}
			}
		}
		
		return $this->_reorder($return);
	}
	
	private function _reorder($objects)
	{		
		$this->EE->load->config($this->order_config);
		
		$object_order = config_item($this->order_config);
		
		$return  = array();
		
		foreach($object_order as $button_name)
		{
			if(isset($objects[$button_name]))
			{
				$return[$button_name] = $objects[$button_name];
			}
			
			unset($objects[$button_name]);
		}
		
		foreach($objects as $button_name => $button)
		{
			$return[$button_name] = $button;
		}
		
		return $return;
	}
	
	private function _load($directory, $addon_name, $file, $params = array())
	{		
		$name  = str_replace('.php', '', $file);
		$class = ucfirst($name).$this->suffix;
		
		if(!class_exists($name))
		{
			require_once(PATH_THIRD . $addon_name . '/'.$directory.'/' . $file);
		}
		
		return new $class($params);
	}
}