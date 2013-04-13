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
		'photo_id' => FALSE,
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
	
	public function average_color()
	{
		$file  = $this->param('file', $this->EE->TMPL->tagdata);		
		$total = $this->param('total', config_item('photo_frame_save_colors'));
		$gran  = $this->param('granularity', config_item('photo_frame_save_color_granularity'));
		$type  = $this->param('type', 'rgb');
		
		$color = $this->EE->photo_frame_lib->get_average_color($file, $total, $granularity);
		
		if(!$color)
		{
			if($this->EE->TMPL->tagdata)
			{
				return $this->EE->TMPL->no_results();
			}
			
			return NULL;
		}
		
		$rgb = 'rgb('.$color->r.','.$color->g.','.$color->b.')';
		$hex = ImageEditor::rgb2hex($rgb);
		
		if($this->EE->TMPL->tagdata && $this->EE->TMPL->tagdata != $file)
		{
			return $this->parse(array($this->EE->channel_data->utility->add_prefix($this->param('prefix', 'color'), array(
				'rgb' => $rgb,
				'hex' => $hex
			))));
		}
		else
		{	
			if(isset($$type))
			{
				return $$type;
			}
		}
	}
	
	public function color_bar()
	{
		$reserved = array(
			'total',
			'granularity',
			'width',
			'height',
			'file'
		);
		
		$file   = $this->param('file', $this->EE->TMPL->tagdata);
		$colors = $this->EE->photo_frame_lib->get_colors($file, $this->param('total', 8), $this->param('granularity', 10));
		
		if(!$colors)
		{
			return $this->EE->TMPL->no_results();
		}
		
		$bars = $this->EE->photo_frame_lib->color_bars($colors, $this->param('width'), $this->param('height', '14px'));
		
		$params = array();
		
		if(!isset($this->EE->TMPL->tagparams['class']))
		{
			$this->EE->TMPL->tagparams['class'] = 'color-bar';
		}
		
		if(is_array($this->EE->TMPL->tagparams))
		{
			foreach($this->EE->TMPL->tagparams as $param => $value)
			{
				if(!in_array($param, $reserved) && !empty($value))
				{
					$params[] = $param.'="'.$value.'"';
				}
			}
		}
		
		return '<div '.implode(' ', $params).'>'.implode('', $bars).'</div>';
	}
	
	public function extract_colors()
	{
		$file   = $this->param('file', $this->EE->TMPL->tagdata);
		$colors = $this->EE->photo_frame_lib->get_colors($file, $this->param('total', 8), $this->param('granularity', 10));
		$html   = array();
		
		if(!$colors)
		{
			return $this->EE->TMPL->no_results();
		}
	
		$limit  = (int) $this->param('limit', count($colors));
		$offset = $this->param('offset', 0);
		$return = array();
		$count  = 0;
		
		foreach($colors as $index => $color)
		{
			if($count < $limit && $index >= $offset)
			{
				$color = (array) $color;
				$color['rgb'] = $color['r'].','.$color['g'].','.$color['b'];
				$color['hex'] = ImageEditor::rgb2hex($color['rgb']);
				
				$return[] = $color;
				$count++;
			}
		}
		
		if(count($return) == 0)
		{				
			return $this->EE->TMPL->no_results();	
		}		
			
		return $this->parse($this->EE->channel_data->utility->add_prefix($this->param('prefix', 'color'), $return));
	}
	
	public function colors($return = FALSE)
	{
		$where = $this->_where();
		
		$colors = $this->EE->photo_frame_model->get_colors(array(
			'where'    => $where,
			'limit'    => $this->param('limit'),
			'offset'   => $this->param('offset'),
			'order_by' => $this->param('order_by', 'depth'),
			'sort'     => $this->param('sort', 'asc'),
		));
		
		if($return)
		{
			return $colors;
		}
		
		$return = array();
		
		foreach($colors->result() as $index => $row)
		{
			$return[$index] = (array) $row;			
			$return[$index]['count'] = $index + 1;
			$return[$index]['index'] = $index;
			$return[$index]['rgb']   = 'rgb('.$row->r.','.$row->g.','.$row->b.')';
			$return[$index]['hex']   = $this->EE->photo_frame_lib->rgb2hex($return[$index]['rgb']);
			$return[$index]['total_colors']   = $colors->num_rows();
			$return[$index]['is_first_color'] = ($index == 0) ? TRUE : FALSE;
			$return[$index]['is_last_color']  = ($index + 1 == $return[$index]['total_colors']) ? TRUE : FALSE;	
		}
		
		if($prefix = $this->param('prefix', 'color'))
		{
			$return = $this->EE->channel_data->utility->add_prefix($prefix, $return);
		}
		
		return $this->parse($return);
	}
	
	public function photos($return = FALSE)
	{
		$where = $this->_where();
		
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
	
	private function _where()
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
				$value = explode('|', $value);
				
				foreach($value as $index => $val)
				{
					$value[$index] = 'or '.$val;
				}
				
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
		
		return $where;
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
