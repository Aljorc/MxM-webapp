import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {fadeInBottom, fadeInTop} from '../../../../animations/animatedComponents';
import {QueryFactory} from '../../../../tableQueries/queryFactory';
import {DataTableComponent} from '../../../../generic-components/data-visualization/data-table/data-table.component';
import {DatatableConfig} from '../../../../models/datatables/datatable-config';
import {DataTableColumnTypes} from '../../../../models/datatables/data-table-column-types';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {TableColumn} from '../../../../models/datatables/table-column';
import {Subject} from 'rxjs';
import {TableColumnType} from '../../../../models/datatables/table-column-type';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {ApiService} from '../../../../services/api/api.service';
import {AuthService} from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-advisores-table',
  templateUrl: './advisores-table.component.html',
  styleUrls: ['./advisores-table.component.scss'],
  animations: [...fadeInTop, ...fadeInBottom]
})
export class AdvisoresTableComponent implements OnInit, OnDestroy, AfterViewInit {

  // --------------------- //
  // Component constructor //
  // --------------------- //
  constructor(
    private apiService: ApiService,
    public router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private colTypes: DataTableColumnTypes,
    private titleService: Title,
    private route: ActivatedRoute,
    private queryFactory: QueryFactory,
  ) {
    this.setTitle('Asesores | MXM');
  }

  // --------------------------- //
  // Local variables declaration //
  // --------------------------- //

  @ViewChild('datatable', { static: true }) datatable: DataTableComponent;

  private onDestroy = new Subject<void>();

  // ------------------------------------------- //
  // Form crud-inputs & validations declaration  //
  // ------------------------------------------- //
  public searchbar = new FormControl({value: '', disabled: false});
  public zone = new FormControl({value: '', disabled: false});

  public searchObject: any;
  public zoneFilterObject: any;

  public zoneOptions: any[] = [];

  // ---------------- //
  // Set title method //
  // ---------------- //
  public setTitle(newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  // ------------------ //
  // On view init cycle //
  // ------------------ //
  ngOnInit() {
    this.getZones();
  }

  // --------------------- //
  // After view init cycle //
  // --------------------- //
  ngAfterViewInit() {
    this.setFilterListeners();
    this.setTableConfig();
  }

  getZones() {
    this.apiService.getDataObjects('zones?filter=' + JSON.stringify({
      fields: ['name', 'id']
    })).pipe(
      takeUntil(this.onDestroy)
    ).subscribe((data: any) => {
      this.zoneOptions = data.data;
    });
  }

  setTableConfig() {
    this.datatable.setCustomFilters(this.getFilters());
    this.datatable.config = new DatatableConfig(
      'AppUsers',
      [],
      'firstname',
      'asc',
      this.getColumns(),
      2,
      false,
      null,
      null,
      2
    );
  }

  setFilterListeners() {
    this.searchbar.valueChanges.pipe(
      takeUntil(this.onDestroy),
      debounceTime(250)
    ).subscribe( (dataSearch) => {
      this.searchObject = this.queryFactory.setSearchQuery(dataSearch, ['firstname', 'lastname', 'phone', 'rfc', 'status']);
      this.datatable.setCustomFilters(this.getFilters());
    });

    this.zone.valueChanges.pipe(
      takeUntil(this.onDestroy)
    ).subscribe( (data) => {
      this.zoneFilterObject = data;
      this.datatable.setCustomFilters(this.getFilters());
    });
  }

  getFilters() {
    const filter: any[] = [{role: 'ADVISER'}];
    if (this.searchObject) { filter.push(this.searchObject); }
    if (this.zoneFilterObject !== '') { filter.push( {zoneId: this.zoneFilterObject} ); }
    return filter;
  }

  getColumns(): TableColumn[] {

    const buttonCol = new TableColumnType(
      'button',
      (data) => this.openAdviser(data.id),
      200,
      {},
      false
    );

    const zoneCol = {
      ...this.colTypes.relation,
      formatter: (data) => (data ? data.zone ? data.zone.name : 'N/D' : 'N/D')
    };

    return [
      new TableColumn('firstname', 'NOMBRE', true, this.colTypes.text),
      new TableColumn('lastname', 'APELLIDO', true, this.colTypes.text),
      new TableColumn('zone', 'ZONA', true, zoneCol),
      new TableColumn('email', 'EMAIL', true, this.colTypes.text),
      new TableColumn('username', 'USUARIO', true, this.colTypes.text),
      new TableColumn('balance', 'BALANCE', true, this.colTypes.money),
      new TableColumn('button', 'ABRIR', false, buttonCol, 'library_books')
    ];
  }

  // --------------------- //
  // Open product function //
  // --------------------- //
  public openAdviser(data: string) {
    // this.router.navigate([data], {relativeTo: this.route}).catch();
  }

  // -------------------- //
  // On destroy lifecycle //
  // -------------------- //
  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.unsubscribe();
  }

}

