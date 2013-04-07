<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class PhotoFrame_channel_search_rule extends Base_rule {
	
	protected $title       = 'Photo Frame';
	
	protected $description = 'The Photo Frame search modifier allows you to search the events stored within the Showtimes fieldtype.';
	
	protected $name        = 'showtimes';
	
	protected $fields = array(
		'showtimes_field' => array(
			'label'       => 'Showtimes Field',
			'description' => 'Enter the name of the channel field that stores the latitude',
		),
		'start_field' => array(
			'label'       => 'Start Field',
			'description' => 'Enter the name of the form field that stores the start date',
		),
		'start_field_default' => array(
			'label'       => 'Start Field Default Value',
			'description' => 'If you wish to assign a default start value, enter it here. This will only be used if no start value has been set with a parameter or form field.<br><br>You may enter a static date or NOW if you want the default start to be dynamic. You may also use PHP strtotime values in this field.',
		),
		'start_operator' => array(
			'label'       => 'Start Operator',
			'description' => 'Enter the operator that will be used for the start date',
			'type' 		  => 'select',
			'settings'    => array(
				'options' => array(
					'>=' => '>=',
					'>'  => '>',
					'='  => '=',
					'!=' => '!=',
					'<'  => '<',
					'<=' => '<='
				)
			)
		),
		'end_field' => array(
			'label'       => 'End Field',
			'description' => 'Enter the name of the form field that stores the end date',
		),
		'end_field_default' => array(
			'label'       => 'End Field Default Value',
			'description' => 'If you wish to assign a default end value, enter it here. This will only be used if no end value has been set with a parameter or form field.<br><br>You may enter a static date or NOW if you want the default start to be dynamic. If no default is set, then the date will never end. You may also use PHP strtotime values in this field.',
		),
		'end_operator' => array(
			'label'       => 'End Operator',
			'description' => 'Enter the operator that will be used for the end date',
			'type' 		  => 'select',
			'settings'    => array(
				'options' => array(
					'<=' => '<=',
					'<'  => '<',
					'='  => '=',
					'!=' => '!=',
					'>'  => '>',
					'>=' => '>=',
				)
			)
		)		
	);
	
	public function __construct($properties = array())
	{
		$this->EE =& get_instance();
		
		$this->EE->load->add_package_path(PATH_THIRD . 'showtimes');
		$this->EE->load->library('showtimes_lib');
		
		parent::__construct($properties);
	}
	
	public function get_select()
	{
		return '
		exp_showtimes.start_time,
		exp_showtimes.end_time,
		exp_showtimes.start_timestamp,
		exp_showtimes.end_timestamp,
		exp_showtimes.start_timestamp as \'start\',
		exp_showtimes.end_timestamp as \'start\',
		exp_showtimes.all_day,
		exp_showtimes.meta';
	}
	
	public function get_join()
	{
		return 'INNER JOIN exp_showtimes ON exp_channel_titles.entry_id = exp_showtimes.entry_id';
	}
	
	public function get_group_by()
	{
		return 'exp_showtimes.entry_id';
	}
	
	public function get_where()
	{
		$rules     = $this->settings->rules;
		$showtimes = $rules->showtimes_field;
		
		if(!isset($this->fields[$showtimes]))
		{
			return;
		}
		
		$where = array();
		$start = $this->input($rules->start_field);
		$end   = $this->input($rules->end_field);
		
		$vars = array(
			'start_field_default' => 'start',
			'end_field_default'   => 'end'
		);
		
		$format = array(
			'start' => 'Y-m-d 00:00:00',
			'end'   => 'Y-m-d 23:59:59',
		);
		
		$time = time();
		
		foreach($vars as $index => $var)
		{						
			if(isset($rules->$index) && !empty($rules->$index))
			{
				if(!$$var)
				{
					$$var = $this->_convert_time($format[$var], strtotime($rules->$index, $time));					
				}
				else
				{
					$$var = $this->_convert_time($format[$var], $$var);
				}
				
				//$_GET[$var] = $$var;
				
				$time = strtotime($$var);
			}	
		}	
		
		if($start && !$this->_reserved($start))
		{
			$where[] = 'exp_showtimes.start_timestamp '.$rules->start_operator.' \''.$this->_convert_time('Y-m-d 00:00:00', $start).'\'';
		}
		
		if($end && !$this->_reserved($end))
		{
			$where[] = 'exp_showtimes.start_timestamp '.$rules->end_operator.' \''.$this->_convert_time('Y-m-d 23:59:59', $end).'\'';
		}
		
		return $where;
	}

	public function get_vars()
	{
		$vars = array(
			'start' => $this->input('start'),
			'end'   => $this->input('end')
		);
		
		if(empty($vars['start']) || !$vars['start'])
		{
			$vars['start'] = date('Y-m-d 00:00:00', time());
		}
		
		if(empty($vars['end']) || !$vars['end'])
		{
			$vars['end'] = date('Y-m-d 23:59:59', $vars['end']);
		}
		
		foreach($vars as $index => $var)
		{
			$vars[$index] = strtotime($var);
		}
		
		return parent::get_vars($vars);
	}
	
	private function _parse($string)
	{		
		$presets = array(
			'NOW'     => time(),
			'TODAY'   => date('Y-m-d 00:00:00', time()),
			'TONIGHT' => date('Y-m-d 23:59:59', time())
		);
		
		foreach($presets as $presets => $value)
		{
			$string = str_replace($presets, $value, $string);
		}
		
		return $string;
	}
	
	private function _convert_time($format, $time)
	{
		return $this->EE->showtimes_lib->format_date($format, $time);
	}
		
	private function _reserved($date)
	{
		return $this->EE->showtimes_lib->is_reserved($date);
	}
}