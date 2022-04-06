import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';//Импорты для работы с сервером

//Параметры запроса
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': 'application/json' })
}

//Интерфейсы для ниже указанных переменных
interface IPatient {
  ID: string,
  Name: string,
  Sex: number,
  Birthday: string,
  DepartamentId: string,
  Diagnoses: string[],
  Procedures: string[]
}

interface IPatientResult {
  diagnoses: {
    description: string,
    flags: string[]
  },
  procedures: {
    description: string,
    flags: string[]
  },
  mdc: string,
  mdcDescription: string,
  drg: string,
  drgDescription: string,
  entgelt: number
}

interface DiagnosesProcedures {
  id: number
  status: boolean,
  title: string,
  description: string,
  flags: string[]
}

@Component({
  selector: 'patient-card',
  templateUrl: './patient-card.component.html',
  styleUrls: ['./patient-card.component.css']
})
export class PatientCardComponent{
  //Инициализируем переменную http для работы с сервером
  constructor(private http: HttpClient){}
  //Переменная с данными клиента, которые передаются на сервер для рассчета
  public Patient: IPatient[]
  //Переменная с данными клиента, которые получаем от сервера после рассчета
  public PatientResult: IPatientResult
  //Создаем отдельные переменные для удобства работы со перечнями диагнозов и процедур на клиенте
  public Diagnoses: DiagnosesProcedures[] = []
  public Procedures: DiagnosesProcedures[] = []

  //Добавляем элементы в массив Diagnoses от клиента
  addDiagnose(diagnose_input: any) {
    //Проверяем полученные данные. Если получили не пустую строку, работаем дальше
    if (diagnose_input.value != '') {
      //Определяем id последнего элемента в массиве Diagnoses
      if (this.Diagnoses.length === 0) {
        //Если в массиве пусто, присваиваем переменной lastId значение -1
        var lastId: number = -1
      } else {
        //Если в массиве есть элементы, присваиваем переменной lastId значение "id" последнего элемента массива
        var lastId: number = this.Diagnoses[this.Diagnoses.length - 1].id
      }
      //Добавляем в массив Diagnoses новый объект диагноза
      this.Diagnoses.push({
        id: lastId + 1,
        status: true,
        title: diagnose_input.value,
        description: '',
        flags: []
      })
      //Очищаем input, из которого получили данные от клиента
      diagnose_input.value = ''
      //Вызываем функцию обновления подмассива Diagnoses в массиве Patient
      this.getPatientResult('Diagnoses')
    }
  }

  //Добавляем элементы в массив Diagnoses от клиента (вся остальная логика работы аналогична предыдущей)
  addProcedure(procedure_input: any) {
    if (procedure_input.value != '') {
      if (this.Procedures.length === 0) {
        var lastId: number = -1
      } else {
        var lastId: number = this.Procedures[this.Procedures.length - 1].id
      }

      this.Procedures.push({
        id: lastId + 1,
        status: true,
        title: procedure_input.value,
        description: '',
        flags: []
      })

      procedure_input.value = ''
      this.getPatientResult('Procedures')
    }    
  }

  //Получаем данные из другого компонента "patient-data"
  personalData(PersonalData: any) {
    //Присваиваем полученные данные в массив Patient
    this.Patient = PersonalData
  }

  //Обновляем наименование диагнозов и процедур из массивов Diagnoses и Procedures в массив Patient,
  //чтобы при отправке Patient на сервер передать и новые добавленные диагнозы и процедуры
  getPatientResult(type: string) {
    //Если диагноз, работаем с массивом Diagnoses
    if ('Diagnoses' == type) {
      //Сначала очищаем подмассив Diagnoses в массиве Patient
      this.Patient['Diagnoses'] = []

      //Перебираем элементы масива Diagnoses
      for (let key in this.Diagnoses) {
        //Провераем статус каждого элемента в массиве Diagnoses, чтобы отсечь "выключенные" (со статусом "false") и не работать с ними
        if (this.Diagnoses[key].status == true) {
          //Добавляем наименования всех элементов со статусом "true" из массива Diagnoses в подмассив Diagnoses массива Patient
          this.Patient['Diagnoses'].push(this.Diagnoses[key].title)
        }
      }
    }
    //Если процедура, работаем с массивом Procedures (вся остальная логика работы аналогична предыдущей)
    else if ('Procedures' == type) {
      this.Patient['Procedures'] = []

      for (let key in this.Procedures) {
        if (this.Procedures[key].status == true) {
          this.Patient['Procedures'].push(this.Procedures[key].title)
        }
      }
    }
    //Вызываем отправку всех данных клиента после изменения
    this.postData()
  }

  //Изменяем статус элемента, чтобы указать, принимает он учасние в рассчете данных клиента или нет
  changeStatus(type: string, id: number, status: boolean) {
    //Если диагноз, работаем с массивом Diagnoses
    if ('Diagnoses' == type) {
      for (let i = 0; i < this.Diagnoses.length; i++) {
        //Ищем элемент массива по "id"
        if (this.Diagnoses[i].id === id) {
          //Если элемент найден, меняем его статус на обратный
          this.Diagnoses[i].status = !status//Задаем обратное значение
        }
      }
    }

    //Если процедура, работаем с массивом Procedures (вся остальная логика работы аналогична предыдущей)
    else if ('Procedures' == type) {
      for (let i = 0; i < this.Procedures.length; i++) {
        if (this.Procedures[i].id === id) {
          this.Procedures[i].status = !status
        }
      }
    }
    //Вызываем отправку всех данных клиента после изменения
    this.postData()
  }

  //Удаляем элемент из панели диагнозов и процедур
  deleteItem(type: string, id: number) {
    //Если диагноз, работаем с массивом Diagnoses
    if ('Diagnoses' == type) {
      for (let i = 0; i < this.Diagnoses.length; i++) {
        //Ищем элемент массива по "id"
        if (this.Diagnoses[i].id === id) {
          //Если элемент найден, удаляем его из Diagnoses
          this.Diagnoses.splice(i, 1)
        }
      }
    }
    //Если процедура, работаем с массивом Procedures (вся остальная логика работы аналогична предыдущей)
    else if ('Procedures' == type) {
      for (let i = 0; i < this.Procedures.length; i++) {
        if (this.Procedures[i].id === id) {
          this.Procedures.splice(i, 1)
        }
      }
    }

    //Вызываем отправку всех данных клиента после изменения
    this.postData()
  }

  //Функция, которая дополняет данными из сервера объекты в Diagnoses и в Procedures
  additionDiagnosesProcedures() {
    //Отдельный итератор для перебора объектов в PatientResult
    let j = 0

    for (let i = 0; i < this.Diagnoses.length; i++) {
      //Провераем статус каждого элемента в массиве Diagnoses, чтобы отсечь "выключенные" (со статусом "false") и не работать с ними
      if (this.Diagnoses[i].status == true) {
        //Если статус элемента "true", он принимает участие в рассчете и принимает в себя дополнительные данные из сервера
        this.Diagnoses[i].description = this.PatientResult.diagnoses[j].description
        this.Diagnoses[i].flags = this.PatientResult.diagnoses[j].flags
        //Уваличиваем итератор на +1
        j++
      }
    }

    //Ообнуляем итератор для повторного использования
    j = 0
    //Логика работы аналогична предыдущей, только работаем с массивом Procedures
    for (let i = 0; i < this.Procedures.length; i++) {
      if (this.Procedures[i].status == true) {
        this.Procedures[i].description = this.PatientResult.procedures[j].description
        this.Procedures[i].flags = this.PatientResult.procedures[j].flags
        j++
      }
    }
  }

  //Отправка данных на сервер
  postData(){
    this.http.post<IPatient>('https://localhost:5001/Patient', this.Patient, httpOptions).subscribe(response => {
      //Получаем ответ от сервера, содержащий объект с данными и присваеваем его в PatientResult
      this.PatientResult = response['response'];

      //Вызываем функцию, которая дополняет данными из сервера объекты в Diagnoses и в Procedures
      this.additionDiagnosesProcedures()
    }, error => console.error(error));
  }
}
