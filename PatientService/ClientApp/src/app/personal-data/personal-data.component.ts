import { Component, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';//Импорты для работы с сервером

//Параметры запроса
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
}

//Интерфейс для ниже указанной переменной
interface IDepartaments{
  ID: string;
  name: string;
}

@Component({
  selector: 'personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.css']
})
export class PersonalDataComponent{
  //Инициализируем переменную http для работы с сервером
  constructor(private http: HttpClient) { }
  //Переменная со списком департаментов, который получаем от сервера
  public DepartamentsList: IDepartaments[]
  //После инициализации страницы вызываем функция получения данных от сервера
  ngOnInit() {
    this.getDepartaments()
  }
  //Функция для получения списка департаментов от сервера
  getDepartaments() {
    this.http.get<IDepartaments>('https://localhost:5001/DepartamentsList', httpOptions).subscribe(response => {
      //Полученные данные от сервера добавляем в переменную "DepartamentsList"
      this.DepartamentsList = response['departaments']
    });
  }
  //Создаем объект, позволяющий передавать данные родительскому компоненту "patient-card"
  @Output() OutPersonalData = new EventEmitter();
  //Создаем переменные для работы с анкетными данными пациента
  public ID: string = ''
  public Name: string = ''
  public Sex: number = null
  public Birthday: string = ''
  public DepartamentId: string = ''
  //Функиця, которая вызывается при введении данных в анкету пациента
  onInput() {
    //Создаем объект с анкетными данными пациента
    let PersonalData = 
    {
      'ID': this.ID,
      'Name': this.Name,
      'Sex': Number(this.Sex),
      'Birthday': this.Birthday,
      'DepartamentId': this.DepartamentId
    }
    //Создаем итератор для перебора объекта
    let empty: number = 0
    //Перебираем объект "PersonalData"
    for (let key in PersonalData) {
      //Проверяем, есть ли незаполненные поля в анкете клиента
      if (PersonalData[key] == '' || PersonalData[key] == null) {
        //Если есть незаполненное поле в анкете клиента, увеличиваем значение итератора на +1
        empty++
      }
    }
    //Если все поля в анкете клиента заполнены (не пустые), отправляем объект "PersonalData" родительскому компоненту "patient-card"
    if (empty == 0) this.OutPersonalData.emit(PersonalData)
  }
}
