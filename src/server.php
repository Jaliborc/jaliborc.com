<?
  $fields = array('secret' => 'PRIVATE_KEY', 'response' => $_GET['token']);

  foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
  $fields_string = rtrim($fields_string,'&');

  $connection = curl_init();
  curl_setopt($connection,CURLOPT_URL, 'https://www.google.com/recaptcha/api/siteverify');
  curl_setopt($connection,CURLOPT_POST, count($fields));
  curl_setopt($connection,CURLOPT_POSTFIELDS, $fields_string);
  curl_setopt($connection,CURLOPT_RETURNTRANSFER, TRUE);

  $result = json_decode(curl_exec($connection), true);
  if ($result['success'] == 1) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Origin");

    header("Content-Type: application/json; charset=utf-8");
    echo json_encode(array(SECURE_DATA));
  }
?>
