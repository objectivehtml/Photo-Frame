<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * Photo Frame
 * 
 * @package		Photo Frame
 * @author		Justin Kimbrell
 * @copyright	Copyright (c) 2012, Justin Kimbrell
 * @link 		http://www.objectivehtml.com/photo-frame
 * @version		0.7.0
 * @build		20121031
 */
 
class Photo_frame {
	
	protected $exclude_params = array(
		'where'    => FALSE,
		'limit'    => FALSE,
		'offset'   => 0,
		'order_by' => 'order',
		'sort'     => 'asc',
		'field_id' => FALSE,
		'entry_id' => FALSE,
	);
	
	protected $where_params = array(
		'field_id' => FALSE,
		'entry_id' => FALSE,
		'id'	   => FALSE,
	);
	
	public function __construct()
	{
		$this->EE =& get_instance();
		
		$this->EE->load->library('photo_frame_lib');
		$this->EE->load->model('photo_frame_model');
	}
	
	private function _set_param($param, $value)
	{
		$this->EE->TMPL->tagparams[$param] = $value;	
	}
	
	public function first_photo()
	{
		$offset = 0 + (int) $this->param('offset');
		
		$this->_set_param('limit', 1 + (int) $this->param('limit', 0));
		$this->_set_param('offset', $offset);
		
		return $this->photos();
	} 
	
	public function last_photo()
	{
		$offset = $this->total_photos() - 1 - (int) $this->param('offset');
		
		$this->_set_param('limit', 1 + (int) $this->param('limit', 0));		
		$this->_set_param('offset', $offset);
		
		return $this->photos();
	} 
	
	public function total_photos()
	{
		return $this->photos(TRUE)->num_rows();
	}
	
	public function photos($return = FALSE)
	{
		if($field_name = $this->param('field_name'))
		{
			$this->_set_param('field_id', $this->EE->channel_data->get_field_by_name($field_name)->row('field_id'));	
		}
		
		$where = array('site_id' => config_item('site_id'));
		
		foreach($this->where_params as $var_name => $default)
		{
			if($value = $this->param($var_name, $default))
			{
				$where[$var_name] = $value;		
			}
		}
		
		if(is_array($this->EE->TMPL->tagparams))
		{
			foreach($this->EE->TMPL->tagparams as $param => $value)
			{
				if(!isset($this->exclude_params[$param]))
				{					
					if(preg_match('/^where:/', $param))
					{
						$param = preg_replace('/^where:/', '', $param);
						
						$where[$param] = $value;
					}
				}
			}
		}
		
		$photos = $this->EE->photo_frame_model->get_photos(array(
			'where'    => $where,
			'limit'    => $this->param('limit'),
			'offset'   => $this->param('offset'),
			'order_by' => $this->param('order_by', 'order'),
			'sort'     => $this->param('sort', 'asc'),
		));
		
		if($return)
		{
			return $photos;
		}
		
		$return = array();
		
		$upload_prefs = $this->EE->photo_frame_model->get_file_upload_groups();

		foreach($photos->result() as $index => $row)
		{
			$row = $this->EE->photo_frame_lib->parse_vars($row, $upload_prefs, $this->param('directory'));
				
			if(!empty($row['sizes']))
			{
				$sizes = json_decode($row['sizes']);
				
				if(isset($sizes->{$this->param('size')}))	
				{
					$row['file'] = $this->EE->photo_frame_model->parse($sizes->{$this->param('size')}->file, 'file');						
					$row['url']  = $this->EE->photo_frame_model->parse($sizes->{$this->param('size')}->file, 'url');					
					$row['file_name'] = $this->EE->photo_frame_model->file_name($sizes->{$this->param('size')}->file);
				}
			}	
			
			$return[$index] = (array) $row;
			
			$return[$index]['count'] = $index + 1;
			$return[$index]['index'] = $index;
			$return[$index]['total_photos'] = $photos->num_rows();
			$return[$index]['is_first_photo'] = ($index == 0) ? TRUE : FALSE;
			$return[$index]['is_last_photo']  = ($index + 1 == $return[$index]['total_photos']) ? TRUE : FALSE;					
		}
		
		if($prefix = $this->param('prefix', 'photo'))
		{
			$return = $this->EE->channel_data->utility->add_prefix($prefix, $return);
		}
		
		return $this->parse($return);
	}
	
	public function response_action()
	{		
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_lib->response_action();
	}
	
	public function crop_action()
	{		
		$this->EE->load->library('photo_frame_lib');
		
		$this->EE->photo_frame_lib->crop_action();
	}
	
	private function parse($vars, $tagdata = FALSE)
	{
		if($tagdata === FALSE)
		{
			$tagdata = $this->EE->TMPL->tagdata;
		}
			
		return $this->EE->TMPL->parse_variables($tagdata, $vars);
	}
	
	private function param($param, $default = FALSE, $boolean = FALSE, $required = FALSE)
	{
		$name	= $param;
		$param 	= $this->EE->TMPL->fetch_param($param);
		
		if($required && !$param) show_error('You must define a "'.$name.'" parameter in the '.__CLASS__.' tag.');
			
		if($param === FALSE && $default !== FALSE)
		{
			$param = $default;
		}
		else
		{				
			if($boolean)
			{
				$param = strtolower($param);
				$param = ($param == 'true' || $param == 'yes') ? TRUE : FALSE;
			}			
		}
		
		return $param;			
	}
}